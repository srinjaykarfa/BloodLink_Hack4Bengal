import { NextResponse } from "next/server"

// Mock donor data - in a real app, this would come from a database
const donors = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0123",
    bloodType: "O-",
    location: "Downtown, City",
    available: true,
    lastDonation: "2024-04-15",
    totalDonations: 15,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1-555-0124",
    bloodType: "A+",
    location: "Midtown, City",
    available: true,
    lastDonation: "2024-05-20",
    totalDonations: 8,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bloodType = searchParams.get("bloodType")
  const location = searchParams.get("location")

  let filteredDonors = donors

  if (bloodType && bloodType !== "all") {
    filteredDonors = filteredDonors.filter((donor) => donor.bloodType === bloodType)
  }

  if (location && location !== "all") {
    filteredDonors = filteredDonors.filter((donor) => donor.location.toLowerCase().includes(location.toLowerCase()))
  }

  return NextResponse.json(filteredDonors)
}

export async function POST(request: Request) {
  const body = await request.json()

  // In a real app, you would save this to a database
  const newDonor = {
    id: donors.length + 1,
    ...body,
    totalDonations: 0,
    available: true,
  }

  donors.push(newDonor)

  return NextResponse.json({ success: true, donor: newDonor }, { status: 201 })
}
