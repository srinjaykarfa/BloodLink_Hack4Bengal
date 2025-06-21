import { NextResponse } from "next/server"

// Mock inventory data
const inventory = {
  "O+": { units: 45, capacity: 60, status: "good" },
  "O-": { units: 12, capacity: 30, status: "critical" },
  "A+": { units: 38, capacity: 50, status: "good" },
  "A-": { units: 8, capacity: 25, status: "low" },
  "B+": { units: 22, capacity: 35, status: "moderate" },
  "B-": { units: 5, capacity: 20, status: "critical" },
  "AB+": { units: 15, capacity: 20, status: "good" },
  "AB-": { units: 3, capacity: 15, status: "low" },
}

export async function GET() {
  return NextResponse.json(inventory)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { bloodType, units } = body

  if (inventory[bloodType as keyof typeof inventory]) {
    inventory[bloodType as keyof typeof inventory].units = units

    // Update status based on capacity
    const item = inventory[bloodType as keyof typeof inventory]
    const percentage = (item.units / item.capacity) * 100

    if (percentage < 30) {
      item.status = "critical"
    } else if (percentage < 50) {
      item.status = "low"
    } else if (percentage < 70) {
      item.status = "moderate"
    } else {
      item.status = "good"
    }
  }

  return NextResponse.json({ success: true, inventory })
}
