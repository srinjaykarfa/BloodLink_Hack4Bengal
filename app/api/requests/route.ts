import { NextResponse } from "next/server"

// Mock blood request data
const bloodRequests = [
  {
    id: 1,
    patientName: "Emergency Patient",
    bloodType: "O-",
    unitsNeeded: 2,
    urgency: "critical",
    hospital: "City General Hospital",
    contactPhone: "+1-555-0199",
    status: "active",
    createdAt: "2024-06-21T10:30:00Z",
  },
]

export async function GET() {
  return NextResponse.json(bloodRequests)
}

export async function POST(request: Request) {
  const body = await request.json()

  const newRequest = {
    id: bloodRequests.length + 1,
    ...body,
    status: "active",
    createdAt: new Date().toISOString(),
  }

  bloodRequests.push(newRequest)

  // In a real app, you would:
  // 1. Save to database
  // 2. Send notifications to matching donors
  // 3. Alert nearby hospitals

  return NextResponse.json({ success: true, request: newRequest }, { status: 201 })
}
