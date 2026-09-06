import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "inr",
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "paid", "rejected"],
      default: "pending",
      index: true,
    },

    payoutSnapshot: {
      accountHolderName: {
        type: String,
        trim: true,
      },

      bankName: {
        type: String,
        trim: true,
      },

      accountLast4: {
        type: String,
        trim: true,
      },

      ifsc: {
        type: String,
        trim: true,
      },

      upiId: {
        type: String,
        trim: true,
      },
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;