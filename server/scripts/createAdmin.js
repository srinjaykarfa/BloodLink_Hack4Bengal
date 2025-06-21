const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/bloodbank", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@bloodbank.com" })

    if (existingAdmin) {
      console.log("❌ Admin user already exists!")
      console.log("📧 Email: admin@bloodbank.com")
      console.log("🔑 Password: admin123")
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Create admin user
    const adminUser = new User({
      firstName: "System",
      lastName: "Administrator",
      email: "admin@bloodbank.com",
      password: hashedPassword,
      phone: "+880-1700-000000",
      bloodType: "O+",
      userType: "admin", // This is the key field
      isVerified: true,
      isActive: true,
      address: {
        street: "Admin Office",
        city: "Dhaka",
        state: "Dhaka",
        zipCode: "1000",
        country: "Bangladesh",
      },
    })

    await adminUser.save()

    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@bloodbank.com")
    console.log("🔑 Password: admin123")
    console.log("👤 User Type: admin")
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
  } finally {
    mongoose.connection.close()
  }
}

createAdminUser()
