import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, address, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      address,
      phone,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, address, phone } = req.body;
    
    // Get current user
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being updated and if it's already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user",
        });
      }
    }

    // Update fields only if provided
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;
    if (phone !== undefined) updateFields.phone = phone;
    // Note: profile_photo is handled by separate upload endpoint

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // Update user with validation
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      {
        new: true, // Return updated document
        runValidators: true, // Run mongoose validations
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });

  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// @desc    Test Cloudinary connection
// @route   GET /api/auth/test-cloudinary
// @access  Private (for testing only)
router.get("/test-cloudinary", protect, async (req, res) => {
  try {
    // Test Cloudinary connection by getting account details
    const result = await cloudinary.api.ping();
    res.status(200).json({
      success: true,
      message: "Cloudinary connection successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
      error: error.message
    });
  }
});

// @desc    Upload profile photo
// @route   POST /api/auth/upload-profile-photo
// @access  Private
router.post("/upload-profile-photo", protect, async (req, res) => {
  try {
    const { image } = req.body;

    // Validate if image is provided
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Please provide an image to upload",
      });
    }

    // Get current user
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Uploading profile photo for user:", user.email);
    console.log("Image type:", typeof image);
    console.log("Image preview:", image.substring(0, 50) + "...");

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "profile_photos", // Store in profile_photos folder
      resource_type: "auto",
      transformation: [
        { width: 400, height: 400, crop: "fill" }, // Resize to 400x400
        { quality: "auto" }, // Optimize quality
        { format: "jpg" } // Convert to JPG
      ],
      public_id: `user_${req.user.userId}_${Date.now()}` // Unique filename
    });

    // Update user's profile photo URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { profile_photo: uploadResponse.secure_url },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        user: updatedUser,
        cloudinary_public_id: uploadResponse.public_id,
        upload_info: {
          width: uploadResponse.width,
          height: uploadResponse.height,
          format: uploadResponse.format,
          bytes: uploadResponse.bytes
        }
      },
    });

  } catch (error) {
    console.error("Profile photo upload error:", error);
    
    // Handle Cloudinary errors
    if (error.message && error.message.includes("Invalid image")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Please upload a valid image file.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error uploading profile photo",
      error: error.message,
    });
  }
});

export default router;