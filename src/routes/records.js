import express from "express";
import Record from "../models/Record.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Create a new record
// @route   POST /api/records
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { analysis_timestamp, lump_detected, predicted_size_cm, confidence_percentage } = req.body;

    // Create new record with user ID from JWT token
    const recordData = {
      user: req.user.userId,
      lump_detected,
      confidence_percentage,
    };

    // Add analysis_timestamp if provided, otherwise use default (current time)
    if (analysis_timestamp) {
      recordData.analysis_timestamp = new Date(analysis_timestamp);
    }

    // Add predicted_size_cm only if lump is detected
    if (lump_detected && predicted_size_cm !== undefined) {
      recordData.predicted_size_cm = predicted_size_cm;
    }

    const record = await Record.create(recordData);

    // Populate user information in response
    await record.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: {
        record,
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

// @desc    Get all records for the authenticated user
// @route   GET /api/records
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-analysis_timestamp' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get records for the authenticated user only
    const records = await Record.find({ user: req.user.userId })
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalRecords = await Record.countDocuments({ user: req.user.userId });
    const totalPages = Math.ceil(totalRecords / limitNum);

    res.status(200).json({
      success: true,
      message: "Records retrieved successfully",
      data: {
        records,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRecords,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
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

// @desc    Get a specific record by ID
// @route   GET /api/records/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      user: req.user.userId, // Ensure user can only access their own records
    }).populate('user', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or you don't have permission to access it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Record retrieved successfully",
      data: {
        record,
      },
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid record ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      user: req.user.userId, // Ensure user can only delete their own records
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or you don't have permission to delete it",
      });
    }

    await Record.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
      data: {
        deletedRecord: record,
      },
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid record ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export default router;