const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all donors with filters
router.get("/", async (req, res) => {
  try {
    const { bloodType, city, available, page = 1, limit = 10 } = req.query

    // Build query
    const query = { userType: "donor", isActive: true }

    if (bloodType && bloodType !== "all") {
      query.bloodType = bloodType
    }

    if (city && city !== "all") {
      query["address.city"] = new RegExp(city, "i")
    }

    if (available === "true") {
      query["donorInfo.isAvailable"] = true
    }

    // Execute query with pagination
    const donors = await User.find(query)
      .select("-password")
      .sort({ "donorInfo.totalDonations": -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      donors,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get donors error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch donors",
    })
  }
})

// Get donor by ID
router.get("/:id", async (req, res) => {
  try {
    const donor = await User.findOne({
      _id: req.params.id,
      userType: "donor",
      isActive: true,
    }).select("-password")

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      })
    }

    res.json({
      success: true,
      donor,
    })
  } catch (error) {
    console.error("Get donor error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch donor",
    })
  }
})

// Update donor availability
router.patch("/:id/availability", auth, async (req, res) => {
  try {
    const { isAvailable } = req.body

    const donor = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "donor" },
      { "donorInfo.isAvailable": isAvailable },
      { new: true },
    ).select("-password")

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      })
    }

    res.json({
      success: true,
      message: "Availability updated successfully",
      donor,
    })
  } catch (error) {
    console.error("Update availability error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
    })
  }
})

// Record donation
router.post("/:id/donation", auth, async (req, res) => {
  try {
    const { donationDate, notes } = req.body

    const donor = await User.findOneAndUpdate(
      { _id: req.params.id, userType: "donor" },
      {
        "donorInfo.lastDonationDate": donationDate || new Date(),
        $inc: { "donorInfo.totalDonations": 1 },
      },
      { new: true },
    ).select("-password")

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      })
    }

    res.json({
      success: true,
      message: "Donation recorded successfully",
      donor,
    })
  } catch (error) {
    console.error("Record donation error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to record donation",
    })
  }
})

// Get donors by blood type and location (for emergency requests)
router.get("/emergency/:bloodType", async (req, res) => {
  try {
    const { bloodType } = req.params
    const { city, urgency } = req.query

    const query = {
      userType: "donor",
      bloodType,
      isActive: true,
      "donorInfo.isAvailable": true,
    }

    if (city) {
      query["address.city"] = new RegExp(city, "i")
    }

    const donors = await User.find(query)
      .select("firstName lastName phone email bloodType address donorInfo")
      .sort({ "donorInfo.totalDonations": -1 })
      .limit(urgency === "critical" ? 50 : 20)

    res.json({
      success: true,
      donors,
      count: donors.length,
    })
  } catch (error) {
    console.error("Emergency donors error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch emergency donors",
    })
  }
})

module.exports = router
