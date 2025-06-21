import { type NextRequest, NextResponse } from "next/server"

// Mock data - replace with actual database operations
const mockCamps = [
  {
    _id: "1",
    title: "Save Lives Blood Donation Drive",
    organizer: "Red Cross Bangladesh",
    organizerType: "NGO",
    location: "Dhaka Medical College",
    address: "Bakshibazar, Dhaka-1000",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "17:00",
    targetDonors: 200,
    currentDonors: 145,
    bloodTypes: ["A+", "B+", "O+", "AB+"],
    contact: {
      phone: "+880-1234-567890",
      email: "info@redcross.bd",
    },
    description: "Join us for a life-saving blood donation camp. Every drop counts in saving precious lives.",
    status: "ongoing",
    requirements: ["Age 18-60", "Weight 50kg+", "Good Health", "Valid ID"],
    registrations: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T12:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    // In a real app, fetch from database
    return NextResponse.json({
      success: true,
      camps: mockCamps,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch camps",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "title",
      "organizer",
      "organizerType",
      "location",
      "address",
      "date",
      "startTime",
      "endTime",
      "targetDonors",
      "bloodTypes",
      "contact",
      "description",
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Create new camp
    const newCamp = {
      _id: Date.now().toString(),
      ...body,
      currentDonors: 0,
      registrations: [],
      status: "upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real app, save to database
    mockCamps.push(newCamp)

    return NextResponse.json({
      success: true,
      message: "Camp created successfully",
      camp: newCamp,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create camp",
      },
      { status: 500 },
    )
  }
}
