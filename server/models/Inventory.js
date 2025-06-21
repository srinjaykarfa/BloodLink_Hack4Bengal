const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema(
  {
    hospital: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      contactNumber: { type: String, required: true },
      email: { type: String, required: true },
    },
    bloodStock: {
      "A+": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 50, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
      "A-": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 25, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
      "B+": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 35, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
      "B-": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 20, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
      "AB+": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 20, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
      "AB-": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 15, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
      "O+": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 60, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
      "O-": {
        units: { type: Number, default: 0, min: 0 },
        capacity: { type: Number, default: 30, min: 1 },
        lastUpdated: { type: Date, default: Date.now },
      },
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate status for each blood type
inventorySchema.methods.getBloodTypeStatus = function (bloodType) {
  const stock = this.bloodStock[bloodType]
  if (!stock) return "unknown"

  const percentage = (stock.units / stock.capacity) * 100

  if (percentage < 25) return "critical"
  if (percentage < 40) return "low"
  if (percentage < 70) return "moderate"
  return "good"
}

// Get overall hospital status
inventorySchema.methods.getOverallStatus = function () {
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  let criticalCount = 0
  let lowCount = 0

  bloodTypes.forEach((type) => {
    const status = this.getBloodTypeStatus(type)
    if (status === "critical") criticalCount++
    else if (status === "low") lowCount++
  })

  if (criticalCount > 2) return "critical"
  if (criticalCount > 0 || lowCount > 3) return "low"
  if (lowCount > 0) return "moderate"
  return "good"
}

module.exports = mongoose.model("Inventory", inventorySchema)
