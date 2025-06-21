const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    console.log("🔐 Verifying token...")

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("✅ Token decoded:", decoded)

    // Get user from database
    const user = await User.findById(decoded.userId || decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      })
    }

    // Set user info in request object with consistent field names
    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(), // For backward compatibility
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      bloodType: user.bloodType,
      userType: user.userType,
      role: user.userType, // For backward compatibility
      isVerified: user.isVerified,
      isActive: user.isActive,
      donorInfo: user.donorInfo,
    }

    console.log("👤 Authenticated user:", {
      id: req.user.id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      type: req.user.userType,
      bloodType: req.user.bloodType,
    })

    next()
  } catch (error) {
    console.error("❌ Auth middleware error:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      })
    }

    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    })
  }
}

module.exports = auth
