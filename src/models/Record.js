import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    analysis_timestamp: {
      type: Date,
      required: [true, "Analysis timestamp is required"],
      default: Date.now,
    },
    lump_detected: {
      type: Boolean,
      required: [true, "Lump detection result is required"],
    },
    predicted_size_cm: {
      type: Number,
      required: function() {
        return this.lump_detected === true;
      },
      min: [0, "Predicted size cannot be negative"],
      max: [50, "Predicted size seems too large"],
      validate: {
        validator: function(value) {
          // Only validate if lump is detected
          if (this.lump_detected && (value === null || value === undefined)) {
            return false;
          }
          return true;
        },
        message: "Predicted size is required when lump is detected"
      }
    },
    confidence_percentage: {
      type: Number,
      required: [true, "Confidence percentage is required"],
      min: [0, "Confidence percentage cannot be less than 0"],
      max: [100, "Confidence percentage cannot be more than 100"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Index for faster queries by user
recordSchema.index({ user: 1, analysis_timestamp: -1 });

const Record = mongoose.model("Record", recordSchema);

export default Record;