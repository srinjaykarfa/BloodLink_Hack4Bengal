const mongoose = require("mongoose")
const User = require("../models/User")

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/bloodbank", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function updateUserToAdmin(email) {
  try {
    const user = await User.findOne({ email: email })

    if (!user) {
      console.log("❌ User not found with email:", email)
      return
    }

    // Update user to admin
    user.userType = "admin"
    user.isVerified = true
    user.isActive = true

    await user.save()

    console.log("✅ User updated to admin successfully!")
    console.log("📧 Email:", user.email)
    console.log("👤 Name:", user.firstName, user.lastName)
    console.log("🔑 User Type:", user.userType)
  } catch (error) {
    console.error("❌ Error updating user:", error)
  } finally {
    mongoose.connection.close()
  }
}

// Usage: node updateUserToAdmin.js
// Change this email to your existing user email
updateUserToAdmin("your-email@example.com")
