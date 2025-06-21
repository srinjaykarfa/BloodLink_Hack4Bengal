const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, donorInfo } = req.body

    const updateData = {
      firstName,
      lastName,
      phone,
      address,
    }

    // Only update donor info if user is a donor
    const user = await User.findById(req.user.userId)
    if (user.userType === "donor" && donorInfo) {
      updateData.donorInfo = { ...user.donorInfo, ...donorInfo }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    })
  }
})

// Get user statistics (for donors)
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    let stats = {
      userType: user.userType,
      joinDate: user.createdAt,
      isVerified: user.isVerified,
    }

    if (user.userType === "donor") {
      stats = {
        ...stats,
        totalDonations: user.donorInfo?.totalDonations || 0,
        lastDonationDate: user.donorInfo?.lastDonationDate,
        isAvailable: user.donorInfo?.isAvailable || false,
        bloodType: user.bloodType,
      }
    }

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
    })
  }
})

// Update donor availability
router.patch("/availability", auth, async (req, res) => {
  try {
    const { isAvailable } = req.body

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (user.userType !== "donor") {
      return res.status(400).json({
        success: false,
        message: "Only donors can update availability",
      })
    }

    user.donorInfo.isAvailable = isAvailable
    await user.save()

    res.json({
      success: true,
      message: "Availability updated successfully",
      isAvailable: user.donorInfo.isAvailable,
    })
  } catch (error) {
    console.error("Update availability error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
    })
  }
})

// Delete user account
router.delete("/account", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Soft delete - mark as inactive instead of actually deleting
    user.isActive = false
    await user.save()

    res.json({
      success: true,
      message: "Account deactivated successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
    })
  }
})

// Get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user.userId)
    if (!currentUser || currentUser.userType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      })
    }

    const { page = 1, limit = 10, userType, isActive = true } = req.query

    const query = {}
    if (userType && userType !== "all") {
      query.userType = userType
    }
    if (isActive !== "all") {
      query.isActive = isActive === "true"
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      users,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    })
  }
})

module.exports = router
