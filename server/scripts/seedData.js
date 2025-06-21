const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const BloodRequest = require("../models/BloodRequest")
const Inventory = require("../models/Inventory")

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ebloodlink", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const seedUsers = async () => {
  console.log("🌱 Seeding users...")

  const users = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      password: await bcrypt.hash("password123", 12),
      phone: "+1-555-0123",
      bloodType: "O-",
      age: 28,
      address: {
        street: "123 Main St",
        city: "Downtown",
        state: "CA",
        zipCode: "90210",
      },
      userType: "donor",
      isVerified: true,
      donorInfo: {
        isAvailable: true,
        totalDonations: 15,
        lastDonationDate: new Date("2024-04-15"),
      },
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@email.com",
      password: await bcrypt.hash("password123", 12),
      phone: "+1-555-0124",
      bloodType: "A+",
      age: 32,
      address: {
        street: "456 Oak Ave",
        city: "Midtown",
        state: "CA",
        zipCode: "90211",
      },
      userType: "donor",
      isVerified: true,
      donorInfo: {
        isAvailable: true,
        totalDonations: 8,
        lastDonationDate: new Date("2024-05-20"),
      },
    },
    {
      firstName: "Mike",
      lastName: "Davis",
      email: "mike.davis@email.com",
      password: await bcrypt.hash("password123", 12),
      phone: "+1-555-0125",
      bloodType: "B+",
      age: 35,
      address: {
        street: "789 Pine St",
        city: "Uptown",
        state: "CA",
        zipCode: "90212",
      },
      userType: "donor",
      isVerified: true,
      donorInfo: {
        isAvailable: false,
        totalDonations: 22,
        lastDonationDate: new Date("2024-03-10"),
      },
    },
    {
      firstName: "Emily",
      lastName: "Chen",
      email: "emily.chen@email.com",
      password: await bcrypt.hash("password123", 12),
      phone: "+1-555-0126",
      bloodType: "AB-",
      age: 29,
      address: {
        street: "321 Elm St",
        city: "Westside",
        state: "CA",
        zipCode: "90213",
      },
      userType: "donor",
      isVerified: true,
      donorInfo: {
        isAvailable: true,
        totalDonations: 12,
        lastDonationDate: new Date("2024-04-25"),
      },
    },
    {
      firstName: "David",
      lastName: "Wilson",
      email: "d.wilson@email.com",
      password: await bcrypt.hash("password123", 12),
      phone: "+1-555-0127",
      bloodType: "O+",
      age: 41,
      address: {
        street: "654 Maple Ave",
        city: "Eastside",
        state: "CA",
        zipCode: "90214",
      },
      userType: "donor",
      isVerified: true,
      donorInfo: {
        isAvailable: true,
        totalDonations: 31,
        lastDonationDate: new Date("2024-06-01"),
      },
    },
    {
      firstName: "Lisa",
      lastName: "Brown",
      email: "lisa.brown@email.com",
      password: await bcrypt.hash("password123", 12),
      phone: "+1-555-0128",
      bloodType: "A-",
      age: 26,
      address: {
        street: "987 Cedar St",
        city: "Southside",
        state: "CA",
        zipCode: "90215",
      },
      userType: "donor",
      isVerified: true,
      donorInfo: {
        isAvailable: true,
        totalDonations: 7,
        lastDonationDate: new Date("2024-05-15"),
      },
    },
    {
      firstName: "Admin",
      lastName: "User",
      email: "admin@ebloodlink.com",
      password: await bcrypt.hash("admin123", 12),
      phone: "+1-555-0100",
      bloodType: "O+",
      age: 35,
      address: {
        street: "100 Admin St",
        city: "Central",
        state: "CA",
        zipCode: "90200",
      },
      userType: "admin",
      isVerified: true,
    },
  ]

  await User.deleteMany({})
  const createdUsers = await User.insertMany(users)
  console.log(`✅ Created ${createdUsers.length} users`)
  return createdUsers
}

const seedBloodRequests = async (users) => {
  console.log("🩸 Seeding blood requests...")

  const requests = [
    {
      patientName: "Emergency Patient 1",
      bloodType: "O-",
      unitsNeeded: 2,
      urgency: "critical",
      hospital: {
        name: "City General Hospital",
        address: "123 Hospital Ave, Downtown, CA 90210",
        contactNumber: "+1-555-0200",
      },
      requestedBy: users[0]._id,
      contactPhone: "+1-555-0199",
      medicalReason: "Emergency surgery due to accident",
      attendingPhysician: {
        name: "Dr. Smith",
        contact: "+1-555-0201",
      },
      status: "active",
    },
    {
      patientName: "Patient Johnson",
      bloodType: "A+",
      unitsNeeded: 1,
      urgency: "urgent",
      hospital: {
        name: "Metro Medical Center",
        address: "456 Medical Blvd, Midtown, CA 90211",
        contactNumber: "+1-555-0202",
      },
      requestedBy: users[1]._id,
      contactPhone: "+1-555-0203",
      medicalReason: "Scheduled surgery preparation",
      attendingPhysician: {
        name: "Dr. Johnson",
        contact: "+1-555-0204",
      },
      status: "active",
    },
    {
      patientName: "Patient Davis",
      bloodType: "B+",
      unitsNeeded: 3,
      urgency: "moderate",
      hospital: {
        name: "Regional Medical",
        address: "789 Health St, Uptown, CA 90212",
        contactNumber: "+1-555-0205",
      },
      requestedBy: users[2]._id,
      contactPhone: "+1-555-0206",
      medicalReason: "Cancer treatment support",
      attendingPhysician: {
        name: "Dr. Davis",
        contact: "+1-555-0207",
      },
      status: "fulfilled",
      fulfilledAt: new Date(),
      fulfilledBy: users[4]._id,
    },
  ]

  await BloodRequest.deleteMany({})
  const createdRequests = await BloodRequest.insertMany(requests)
  console.log(`✅ Created ${createdRequests.length} blood requests`)
  return createdRequests
}

const seedInventory = async (users) => {
  console.log("🏥 Seeding hospital inventories...")

  const inventories = [
    {
      hospital: {
        name: "City General Hospital",
        address: "123 Hospital Ave, Downtown, CA 90210",
        contactNumber: "+1-555-0200",
        email: "inventory@citygeneral.com",
      },
      bloodStock: {
        "A+": { units: 38, capacity: 50 },
        "A-": { units: 8, capacity: 25 },
        "B+": { units: 22, capacity: 35 },
        "B-": { units: 5, capacity: 20 },
        "AB+": { units: 15, capacity: 20 },
        "AB-": { units: 3, capacity: 15 },
        "O+": { units: 45, capacity: 60 },
        "O-": { units: 12, capacity: 30 },
      },
      managedBy: users[6]._id, // Admin user
    },
    {
      hospital: {
        name: "Metro Medical Center",
        address: "456 Medical Blvd, Midtown, CA 90211",
        contactNumber: "+1-555-0202",
        email: "blood@metromedical.com",
      },
      bloodStock: {
        "A+": { units: 42, capacity: 50 },
        "A-": { units: 12, capacity: 25 },
        "B+": { units: 28, capacity: 35 },
        "B-": { units: 8, capacity: 20 },
        "AB+": { units: 18, capacity: 20 },
        "AB-": { units: 6, capacity: 15 },
        "O+": { units: 52, capacity: 60 },
        "O-": { units: 18, capacity: 30 },
      },
      managedBy: users[6]._id,
    },
    {
      hospital: {
        name: "Regional Medical",
        address: "789 Health St, Uptown, CA 90212",
        contactNumber: "+1-555-0205",
        email: "bloodbank@regional.com",
      },
      bloodStock: {
        "A+": { units: 35, capacity: 50 },
        "A-": { units: 6, capacity: 25 },
        "B+": { units: 18, capacity: 35 },
        "B-": { units: 3, capacity: 20 },
        "AB+": { units: 12, capacity: 20 },
        "AB-": { units: 2, capacity: 15 },
        "O+": { units: 38, capacity: 60 },
        "O-": { units: 8, capacity: 30 },
      },
      managedBy: users[6]._id,
    },
  ]

  await Inventory.deleteMany({})
  const createdInventories = await Inventory.insertMany(inventories)
  console.log(`✅ Created ${createdInventories.length} hospital inventories`)
  return createdInventories
}

const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding...")

    const users = await seedUsers()
    const requests = await seedBloodRequests(users)
    const inventories = await seedInventory(users)

    console.log("🎉 Database seeding completed successfully!")
    console.log("\n📋 Summary:")
    console.log(`   Users: ${users.length}`)
    console.log(`   Blood Requests: ${requests.length}`)
    console.log(`   Hospital Inventories: ${inventories.length}`)
    console.log("\n🔐 Test Accounts:")
    console.log("   Donor: john.smith@email.com / password123")
    console.log("   Admin: admin@ebloodlink.com / admin123")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
