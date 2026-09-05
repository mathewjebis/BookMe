
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requestEmailOtp, verifyEmailOtp } from '../utils/emailOtp.js';
import slugify from '../utils/slug.js';

const createToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  slug: user.slug,
  businessName: user.businessName,
  businessDescription: user.businessDescription,
  brandTheme: user.brandTheme,
  brandAccent: user.brandAccent,
  timezone: user.timezone,
  googleCalendarConnected: user.googleCalendarConnected,
  googleCalendarId: user.googleCalendarId,
  payoutDetails: user.payoutDetails,
  stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
});

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      businessName,
      businessDescription,
      timezone,
      emailOtp,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    // Verify registration OTP
    const otpResult = await verifyEmailOtp({
      email: normalizedEmail,
      purpose: 'registration',
      code: emailOtp,
      consume: true,
    });

    if (!otpResult.verified) {
      return res.status(400).json({
        message: otpResult.reason || 'Email verification is required',
      });
    }

    // Generate unique slug
    const baseSlug = slugify(businessName || name) || 'business';

    let finalSlug = baseSlug;
    let counter = 1;

    while (await User.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashPassword,
      slug: finalSlug,
      businessName: businessName || '',
      businessDescription: businessDescription || '',
      timezone: timezone || 'Asia/Kolkata',
    });

    // Generate JWT
    const token = createToken(user._id);

    return res.status(201).json({
      message: 'Registered Successfully',
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export const requestRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    await requestEmailOtp({
      email: normalizedEmail,
      purpose: "registration",
    });

    return res.status(200).json({
      message: "Verification code sent",
    });
  } catch (error) {
    console.error("Request registration OTP error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, emailOtp } = req.body;

    if (!email || !emailOtp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    const otpResult = await verifyEmailOtp({
      email: normalizedEmail,
      purpose: "registration",
      code: emailOtp,
      consume: false,
    });

    if (!otpResult.verified) {
      return res.status(400).json({
        message: otpResult.reason || "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      message: "OTP verified",
    });
  } catch (error) {
    console.error("Verify registration OTP error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { businessName, businessDescription, timezone, brandTheme, brandAccent } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (businessName !== undefined) user.businessName = businessName;
    if (businessDescription !== undefined) user.businessDescription = businessDescription;
    if (timezone !== undefined) user.timezone = timezone;
    if (brandTheme !== undefined) user.brandTheme = brandTheme;
    if (brandAccent !== undefined) user.brandAccent = brandAccent;

    const baseSlug = slugify(user.businessName || user.name) || 'business';
    let finalSlug = baseSlug;
    let counter = 1;

    while (await User.findOne({ slug: finalSlug, _id: { $ne: user._id } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    user.slug = finalSlug;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: toUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};