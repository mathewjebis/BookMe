import mongoose from 'mongoose';
import User from '../models/User.js';
import WalletTransaction from '../models/walletTransaction.js';
import Withdrawal from '../models/Withdrawal.js';
import { getWalletSummary } from '../utils/wallet.js';

/**
 * Casts a string to a Mongoose ObjectId type.
 */
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

/**
 * Masks an account number by returning only the last 4 digits.
 */
const maskAccountNumber = (accountNumber = '') => {
  const digits = String(accountNumber).replace(/\D/g, '');
  return digits.slice(-4);
};

/**
 * Retrieves an overview of the user's payments including payout details,
 * total wallet balance summary, and recent transactions/withdrawals.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getPaymentOverview = async (req, res) => {
  try {
    const userId = toObjectId(req.user.id);
    const [user, summary, transactions, withdrawals] = await Promise.all([
      User.findById(userId).select('payoutDetails'),
      getWalletSummary(userId),
      WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(15),
      Withdrawal.find({ userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      payoutDetails: user?.payoutDetails || {},
      wallet: summary,
      transactions,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Updates the user's payout (bank/UPI) details.
 * Determines if the payout profile is complete based on provided information.
 * 
 * @param {Object} req - Express request object containing payout details in body.
 * @param {Object} res - Express response object.
 */
export const updatePayoutDetails = async (req, res) => {
  try {
    const { accountHolderName, bankName, accountNumber, ifsc, upiId } = req.body;

    if (!accountHolderName || (!accountNumber && !upiId)) {
      return res.status(400).json({ message: 'Account holder and a bank account or UPI ID are required' });
    }

    const payoutDetails = {
      accountHolderName,
      bankName: bankName || '',
      accountLast4: accountNumber ? maskAccountNumber(accountNumber) : '',
      ifsc: ifsc || '',
      upiId: upiId || '',
      isComplete: Boolean(accountHolderName && (accountNumber || upiId)),
      updatedAt: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { payoutDetails },
      { new: true }
    ).select('payoutDetails');

    res.json({ message: 'Payout details saved', payoutDetails: user.payoutDetails });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Processes a withdrawal request from the user's available wallet balance.
 * Validates minimum amount, available balance, and complete payout details.
 * Creates a withdrawal record and a pending hold transaction.
 * 
 * @param {Object} req - Express request object containing the withdrawal amount.
 * @param {Object} res - Express response object.
 */
export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = toObjectId(req.user.id);
    const amount = Math.round(Number(req.body.amount || 0));

    if (!Number.isSafeInteger(amount) || amount < 100) {
      return res.status(400).json({ message: 'Withdrawal amount must be at least 100 paise' });
    }

    const user = await User.findById(userId).select('payoutDetails');
    if (!user?.payoutDetails?.isComplete) {
      return res.status(400).json({ message: 'Add payout details before requesting a withdrawal' });
    }

    session.startTransaction();

    // Serialize withdrawals for this user so concurrent requests cannot both
    // spend the same available wallet balance.
    await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { walletVersion: 1 } },
      { session, new: true },
    );

    const summary = await getWalletSummary(userId, session);
    if (amount > summary.available) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Withdrawal amount exceeds available balance' });
    }

    const withdrawal = await Withdrawal.create(
      [
        {
          userId,
          amount,
          payoutSnapshot: user.payoutDetails,
        },
      ],
      { session },
    );

    await WalletTransaction.create(
      [
        {
          userId,
          withdrawalId: withdrawal[0]._id,
          type: 'withdrawal_hold',
          amount,
          status: 'pending',
          description: 'Withdrawal requested',
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return res.status(201).json({
      message: 'Withdrawal requested',
      withdrawal: withdrawal[0],
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    await session.endSession();
  }
};
