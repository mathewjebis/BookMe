import rateLimit from "express-rate-limit";
import express from "express";

import {
  getMe,
  loginUser,
  registerUser,
  requestRegistrationOTP,
  updateProfile,
  verifyRegistrationOTP,
} from "../controllers/authController.js";

import auth from "../middleware/auth.js";

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many OTP requests. Try again later.",
  },
});

const router = express.Router();

// Registration
router.post("/register", registerUser);

router.post("/register/request-otp", otpLimiter, requestRegistrationOTP);

router.post("/register/verify-otp", otpLimiter, verifyRegistrationOTP);

// Login
router.post("/login", loginUser);

// Current authenticated user
router.get("/me", auth, getMe);

// Update profile
router.patch("/profile", auth, updateProfile);

export default router;

