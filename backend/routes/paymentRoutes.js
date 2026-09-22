import express from "express";

import {
  getPaymentOverview,
  requestWithdrawal,
  updatePayoutDetails,
} from "../controllers/paymentController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

// Payment overview
router.get("/", auth, getPaymentOverview);

// Update payout details
router.patch("/payout-details", auth, updatePayoutDetails);

// Request withdrawal
router.post("/withdrawals", auth, requestWithdrawal);

export default router;