import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import startNotificationScheduler from "../api/notificationController.js";
import { generateOTP } from "../utils/otpUtils.js";
import { sendOTPEmail } from "../services/emailService.js";

const router = express.Router();


// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user = new User({
      name,
      email,
      password: hashedPassword,
      otpCode: otp,
      otpExpiresAt,
      isVerified: false
    });

    await user.save();

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      console.error("Failed to send OTP email to", email);
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your email with the OTP sent.",
      requiresVerification: true,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your account first",
        requiresVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("user at login", user)
    startNotificationScheduler({ user: { id: user._id, name: user.name, email: user.email } }); // Start scheduler for the new user
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (user.otpCode !== otp) {
      user.otpRetryCount += 1;
      await user.save();

      if (user.otpRetryCount >= 5) {
        return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
      }

      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Generate backup codes on first verification
    const backupCodes = Array.from({ length: 5 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.otpRetryCount = 0;
    user.backupCodes = backupCodes;
    await user.save();

    startNotificationScheduler({ user: { id: user._id, name: user.name, email: user.email } });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Account verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
      backupCodes // Return these once so the user can save them
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.otpRetryCount = 0;
    await user.save();

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.json({ message: "New OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;