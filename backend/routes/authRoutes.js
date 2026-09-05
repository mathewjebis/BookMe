
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

const router = express.Router();

// Registration
router.post("/register", registerUser);

router.post("/register/request-otp", requestRegistrationOTP);

router.post("/register/verify-otp", verifyRegistrationOTP);

// Login
router.post("/login", loginUser);

// Current authenticated user
router.get("/me", auth, getMe);

// Update profile
router.patch("/profile", auth, updateProfile);

export default router;

