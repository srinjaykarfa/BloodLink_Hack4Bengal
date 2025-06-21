const mongoose = require("mongoose")

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: [100, "Patient name cannot exceed 100 characters"],
    },
    bloodType: {
      type: String,
      required: [true, "Blood type is required"],
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    unitsNeeded: {
      type: Number,
      required: [true, "Number of units is required"],
      min: [1, "At least 1 unit is required"],
      max: [10, "Cannot request more than 10 units at once"],
    },
    urgency: {
      type: String,
      required: [true, "Urgency level is required"],
      enum: ["critical", "urgent", "moderate", "routine"],
      default: "moderate",
    },
    hospital: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      contactNumber: { type: String, required: true },
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requested by user is required"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"],
    },
    medicalReason: {
      type: String,
      required: [true, "Medical reason is required"],
      maxlength: [500, "Medical reason cannot exceed 500 characters"],
    },
    attendingPhysician: {
      name: { type: String, required: true },
      contact: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["active", "fulfilled", "cancelled", "expired"],
      default: "active",
    },
    responses: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        responseDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["interested", "confirmed", "completed"],
          default: "interested",
        },
        notes: String,
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        // Set expiration based on urgency
        const hours = {
          critical: 2,
          urgent: 6,
          moderate: 24,
          routine: 72,
        }
        return new Date(Date.now() + hours[this.urgency] * 60 * 60 * 1000)
      },
    },
    fulfilledAt: Date,
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
bloodRequestSchema.index({ bloodType: 1, status: 1, urgency: 1 })
bloodRequestSchema.index({ expiresAt: 1 })
bloodRequestSchema.index({ "hospital.name": 1 })

// Auto-expire requests
bloodRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("BloodRequest", bloodRequestSchema)
