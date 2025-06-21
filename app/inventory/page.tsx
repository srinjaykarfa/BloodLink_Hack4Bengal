import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

export default function InventoryPage() {
  const bloodInventory = [
    { type: "O+", units: 45, capacity: 60, status: "good", trend: "up", percentage: 75 },
    { type: "O-", units: 12, capacity: 30, status: "critical", trend: "down", percentage: 40 },
    { type: "A+", units: 38, capacity: 50, status: "good", trend: "up", percentage: 76 },
    { type: "A-", units: 8, capacity: 25, status: "low", trend: "down", percentage: 32 },
    { type: "B+", units: 22, capacity: 35, status: "moderate", trend: "up", percentage: 63 },
    { type: "B-", units: 5, capacity: 20, status: "critical", trend: "down", percentage: 25 },
    { type: "AB+", units: 15, capacity: 20, status: "good", trend: "stable", percentage: 75 },
    { type: "AB-", units: 3, capacity: 15, status: "low", trend: "down", percentage: 20 },
  ]

  const hospitals = [
    { name: "City General Hospital", total: 89, critical: 2, low: 1 },
    { name: "Metro Medical Center", total: 67, critical: 1, low: 2 },
    { name: "Downtown Hospital", total: 45, critical: 3, low: 1 },
    { name: "Regional Medical", total: 78, critical: 0, low: 3 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-600"
      case "low":
        return "bg-yellow-600"
      case "moderate":
        return "bg-blue-600"
      case "good":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "low":
        return <AlertTriangle className="h-4 w-4" />
      case "good":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Droplets className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Droplets className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blood Inventory</h1>
            <p className="text-gray-600">Real-time blood availability across all partner hospitals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Units</p>
                    <p className="text-3xl font-bold text-gray-900">148</p>
                  </div>
                  <Droplets className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Critical Types</p>
                    <p className="text-3xl font-bold text-red-600">2</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-3xl font-bold text-yellow-600">2</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Well Stocked</p>
                    <p className="text-3xl font-bold text-green-600">4</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Blood Type Inventory</CardTitle>
                <CardDescription>Current stock levels by blood type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {bloodInventory.map((blood) => (
                  <div key={blood.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                          {blood.type}
                        </Badge>
                        <Badge className={getStatusColor(blood.status)}>
                          {getStatusIcon(blood.status)}
                          <span className="ml-1 capitalize">{blood.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {blood.units}/{blood.capacity} units
                        </span>
                        {blood.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {blood.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                      </div>
                    </div>
                    <Progress value={blood.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hospital Network</CardTitle>
                  <CardDescription>Inventory status across partner hospitals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hospitals.map((hospital, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{hospital.name}</h4>
                        <p className="text-sm text-gray-600">{hospital.total} total units</p>
                      </div>
                      <div className="flex space-x-2">
                        {hospital.critical > 0 && <Badge variant="destructive">{hospital.critical} Critical</Badge>}
                        {hospital.low > 0 && <Badge className="bg-yellow-600">{hospital.low} Low</Badge>}
                        {hospital.critical === 0 && hospital.low === 0 && (
                          <Badge className="bg-green-600">Good Stock</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Send Critical Alert
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Droplets className="mr-2 h-4 w-4" />
                    Request Donations
                  </Button>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
