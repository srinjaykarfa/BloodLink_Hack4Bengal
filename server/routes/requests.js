const express = require("express")
const BloodRequest = require("../models/BloodRequest")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Blood compatibility mapping
const bloodCompatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // Universal recipient (can only donate to AB+)
}

// Create blood request - FIXED VERSION
router.post("/", auth, async (req, res) => {
  try {
    console.log("📝 Creating blood request...")
    console.log("👤 User from auth:", req.user)
    console.log("📋 Request body:", req.body)

    const { patientName, bloodType, unitsNeeded, urgency, hospital, contactPhone, medicalReason, attendingPhysician } =
      req.body

    // Validate required fields
    if (
      !patientName ||
      !bloodType ||
      !unitsNeeded ||
      !urgency ||
      !hospital ||
      !contactPhone ||
      !medicalReason ||
      !attendingPhysician
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.userId || req.user._id
    if (!userId) {
      console.error("❌ No user ID found in request")
      return res.status(401).json({
        success: false,
        message: "User authentication failed. Please login again.",
      })
    }

    console.log("✅ Using user ID:", userId)

    // Create the blood request with proper data structure
    const bloodRequestData = {
      patientName: patientName.trim(),
      bloodType,
      unitsNeeded: Number.parseInt(unitsNeeded),
      urgency,
      hospital: {
        name: typeof hospital === "string" ? hospital : hospital.name || hospital,
        address: typeof hospital === "string" ? hospital : hospital.address || "Address not provided",
        contactNumber: typeof hospital === "string" ? contactPhone : hospital.contactNumber || contactPhone,
      },
      requestedBy: userId, // This is the key fix
      contactPhone,
      medicalReason: medicalReason.trim(),
      attendingPhysician: {
        name:
          typeof attendingPhysician === "string" ? attendingPhysician : attendingPhysician.name || attendingPhysician,
        contact: typeof attendingPhysician === "string" ? contactPhone : attendingPhysician.contact || contactPhone,
      },
      status: "active",
    }

    console.log("📋 Blood request data:", bloodRequestData)

    const bloodRequest = new BloodRequest(bloodRequestData)
    await bloodRequest.save()

    // Populate the requestedBy field
    await bloodRequest.populate("requestedBy", "firstName lastName email phone")

    console.log("✅ Blood request created successfully:", bloodRequest._id)

    // Find matching donors
    const matchingDonors = await findMatchingDonors(bloodRequest)

    res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      request: bloodRequest,
      matchingDonors: matchingDonors.length,
    })
  } catch (error) {
    console.error("❌ Create request error:", error)
    console.error("❌ Error details:", error.message)

    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${validationErrors.join(", ")}`,
        errors: validationErrors,
      })
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create blood request",
    })
  }
})

// Helper function to find matching donors
const findMatchingDonors = async (bloodRequest) => {
  try {
    // Get compatible blood types that can donate to the requested type
    const compatibleDonorTypes = []
    for (const [donorType, canDonateTo] of Object.entries(bloodCompatibility)) {
      if (canDonateTo.includes(bloodRequest.bloodType)) {
        compatibleDonorTypes.push(donorType)
      }
    }

    console.log(`🔍 Looking for donors with blood types: ${compatibleDonorTypes.join(", ")}`)

    const donors = await User.find({
      userType: "donor",
      bloodType: { $in: compatibleDonorTypes },
      "donorInfo.isAvailable": true,
      isActive: true,
    })
      .select("firstName lastName email phone bloodType address donorInfo")
      .limit(50)

    console.log(`✅ Found ${donors.length} matching donors`)
    return donors
  } catch (error) {
    console.error("❌ Error finding matching donors:", error)
    return []
  }
}

// Get all blood requests with filters
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching blood requests with query:", req.query)

    const { bloodType, urgency, status = "active", city, page = 1, limit = 10 } = req.query

    // Build query
    const query = { status }

    if (bloodType && bloodType !== "all") {
      query.bloodType = bloodType
    }

    if (urgency && urgency !== "all") {
      query.urgency = urgency
    }

    if (city) {
      query["hospital.address"] = new RegExp(city, "i")
    }

    const requests = await BloodRequest.find(query)
      .populate("requestedBy", "firstName lastName email phone")
      .populate("responses.donor", "firstName lastName email phone bloodType")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await BloodRequest.countDocuments(query)

    console.log(`📊 Found ${requests.length} requests out of ${total} total`)

    res.json({
      success: true,
      requests,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("❌ Fetch requests error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch blood requests",
    })
  }
})

// Get request by ID
router.get("/:id", async (req, res) => {
  try {
    console.log("🔍 Fetching request:", req.params.id)

    const request = await BloodRequest.findById(req.params.id)
      .populate("requestedBy", "firstName lastName email phone")
      .populate("responses.donor", "firstName lastName email phone bloodType")

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      })
    }

    console.log("✅ Request found:", request._id)

    res.json({
      success: true,
      request,
    })
  } catch (error) {
    console.error("❌ Fetch request error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch blood request",
    })
  }
})

// Respond to blood request (donor interest)
router.post("/:id/respond", auth, async (req, res) => {
  try {
    console.log("🔄 Donor responding to request:", req.params.id)
    console.log("👤 Donor:", req.user.id, req.user.firstName, req.user.lastName)

    const request = await BloodRequest.findById(req.params.id)
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      })
    }

    if (request.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This request is no longer active",
      })
    }

    // Check if donor already responded
    const userId = req.user.id || req.user.userId
    const existingResponse = request.responses.find((response) => response.donor.toString() === userId.toString())

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: "You have already responded to this request",
      })
    }

    // Check blood compatibility
    const donorBloodType = req.user.bloodType
    const requiredBloodType = request.bloodType
    const compatibleTypes = bloodCompatibility[donorBloodType] || []

    if (!compatibleTypes.includes(requiredBloodType)) {
      return res.status(400).json({
        success: false,
        message: `Your blood type (${donorBloodType}) is not compatible with the required type (${requiredBloodType})`,
      })
    }

    // Add response
    request.responses.push({
      donor: userId,
      notes: req.body.notes || "I am available to donate blood",
      status: "interested",
    })

    await request.save()
    await request.populate("responses.donor", "firstName lastName email phone bloodType")

    console.log("✅ Response added successfully")

    res.json({
      success: true,
      message: "Response recorded successfully! The requester will contact you soon.",
      request,
    })
  } catch (error) {
    console.error("❌ Respond to request error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to respond to request",
    })
  }
})

// Update request status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    console.log("🔄 Updating request status:", req.params.id)

    const { status, fulfilledBy } = req.body
    const request = await BloodRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      })
    }

    const userId = req.user.id || req.user.userId
    // Check if user owns this request or is admin
    if (request.requestedBy.toString() !== userId.toString() && req.user.userType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this request",
      })
    }

    request.status = status
    if (fulfilledBy) request.fulfilledBy = fulfilledBy
    if (status === "fulfilled") request.fulfilledAt = new Date()

    await request.save()

    console.log("✅ Request status updated")

    res.json({
      success: true,
      message: "Request status updated successfully",
      request,
    })
  } catch (error) {
    console.error("❌ Update status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update request status",
    })
  }
})

// Get user's requests
router.get("/user/my-requests", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId
    console.log("📝 Fetching requests for user:", userId)

    const requests = await BloodRequest.find({ requestedBy: userId })
      .populate("responses.donor", "firstName lastName email phone bloodType")
      .sort({ createdAt: -1 })

    console.log(`📋 Found ${requests.length} requests for user ${userId}`)

    res.json({
      success: true,
      requests,
    })
  } catch (error) {
    console.error("❌ Fetch user requests error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch your requests",
    })
  }
})

// Get matching requests for donor
router.get("/donor/matching", auth, async (req, res) => {
  try {
    console.log("🩸 Fetching matching requests for donor:", req.user.id)
    console.log("🩸 Donor blood type:", req.user.bloodType)

    if (req.user.userType !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can access matching requests",
      })
    }

    // Get compatible blood types that this donor can donate to
    const compatibleTypes = bloodCompatibility[req.user.bloodType] || []
    console.log("🔍 Compatible blood types:", compatibleTypes)

    const userId = req.user.id || req.user.userId
    const matchingRequests = await BloodRequest.find({
      bloodType: { $in: compatibleTypes },
      status: "active",
      // Exclude requests the donor already responded to
      "responses.donor": { $ne: userId },
    })
      .populate("requestedBy", "firstName lastName email phone")
      .sort({ urgency: 1, createdAt: -1 })

    console.log(`✅ Found ${matchingRequests.length} matching requests`)

    res.json({
      success: true,
      requests: matchingRequests,
      donorBloodType: req.user.bloodType,
      compatibleTypes,
    })
  } catch (error) {
    console.error("❌ Fetch matching requests error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch matching requests",
    })
  }
})

// Get donor's response history
router.get("/donor/my-responses", auth, async (req, res) => {
  try {
    console.log("📝 Fetching response history for donor:", req.user.id)

    if (req.user.userType !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can access response history",
      })
    }

    const userId = req.user.id || req.user.userId

    // Find all requests where this donor has responded
    const requestsWithResponses = await BloodRequest.find({
      "responses.donor": userId,
    })
      .populate("requestedBy", "firstName lastName email phone")
      .sort({ createdAt: -1 })

    // Extract the donor's specific responses with request details
    const myResponses = []

    requestsWithResponses.forEach((request) => {
      const donorResponse = request.responses.find((response) => response.donor.toString() === userId.toString())

      if (donorResponse) {
        myResponses.push({
          _id: donorResponse._id,
          responseDate: donorResponse.responseDate,
          status: donorResponse.status,
          notes: donorResponse.notes,
          request: {
            _id: request._id,
            patientName: request.patientName,
            bloodType: request.bloodType,
            unitsNeeded: request.unitsNeeded,
            urgency: request.urgency,
            hospital: request.hospital,
            contactPhone: request.contactPhone,
            status: request.status,
            fulfilledBy: request.fulfilledBy,
            requestedBy: request.requestedBy,
            createdAt: request.createdAt,
          },
        })
      }
    })

    console.log(`✅ Found ${myResponses.length} responses for donor ${userId}`)

    res.json({
      success: true,
      responses: myResponses,
    })
  } catch (error) {
    console.error("❌ Fetch donor responses error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch response history",
    })
  }
})

module.exports = router
