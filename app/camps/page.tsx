"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Heart,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Target,
  Droplets,
  UserPlus,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Camp {
  _id: string
  title: string
  organizer: string
  organizerType: "NGO" | "Hospital" | "Government" | "Corporate"
  location: string
  address: string
  date: string
  startTime: string
  endTime: string
  targetDonors: number
  currentDonors: number
  bloodTypes: string[]
  contact: {
    phone: string
    email: string
  }
  description: string
  status: "upcoming" | "ongoing" | "completed"
  requirements: string[]
  registrations: Array<{
    userId: string
    userName: string
    userEmail: string
    bloodType: string
    registeredAt: string
    status: "registered" | "attended" | "cancelled"
  }>
}

const mockCamps: Camp[] = [
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
  },
  {
    _id: "2",
    title: "Community Blood Collection Camp",
    organizer: "Dhaka Ahsania Mission",
    organizerType: "NGO",
    location: "Uttara Community Center",
    address: "Sector 7, Uttara, Dhaka-1230",
    date: "2024-01-20",
    startTime: "10:00",
    endTime: "16:00",
    targetDonors: 150,
    currentDonors: 0,
    bloodTypes: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    contact: {
      phone: "+880-1987-654321",
      email: "blood@ahsaniamission.org",
    },
    description: "Community-driven initiative to build a sustainable blood supply for emergency needs.",
    status: "upcoming",
    requirements: ["Age 18-65", "Weight 45kg+", "No recent illness", "Fasting not required"],
    registrations: [],
  },
]

export default function CampsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [camps, setCamps] = useState<Camp[]>(mockCamps)
  const [filteredCamps, setFilteredCamps] = useState<Camp[]>(mockCamps)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [organizerFilter, setOrganizerFilter] = useState<string>("all")
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationDialog, setRegistrationDialog] = useState(false)

  useEffect(() => {
    let filtered = camps

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (camp) =>
          camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          camp.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          camp.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((camp) => camp.status === statusFilter)
    }

    // Organizer type filter
    if (organizerFilter !== "all") {
      filtered = filtered.filter((camp) => camp.organizerType === organizerFilter)
    }

    setFilteredCamps(filtered)
  }, [searchTerm, statusFilter, organizerFilter, camps])

  const handleRegister = async (campId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to register for camps",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)
    try {
      // Mock registration - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setCamps((prevCamps) =>
        prevCamps.map((camp) =>
          camp._id === campId
            ? {
                ...camp,
                registrations: [
                  ...camp.registrations,
                  {
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                    userEmail: user.email,
                    bloodType: user.bloodType,
                    registeredAt: new Date().toISOString(),
                    status: "registered" as const,
                  },
                ],
              }
            : camp,
        ),
      )

      toast({
        title: "Registration Successful! 🎉",
        description: "You have been registered for the camp. Check your email for details.",
      })
      setRegistrationDialog(false)
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const isUserRegistered = (camp: Camp) => {
    return user && camp.registrations.some((reg) => reg.userId === user.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getOrganizerColor = (type: string) => {
    switch (type) {
      case "NGO":
        return "bg-red-100 text-red-800 border-red-200"
      case "Hospital":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Government":
        return "bg-green-100 text-green-800 border-green-200"
      case "Corporate":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 via-pink-600 to-red-700 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 mr-4 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold">Blood Donation Camps</h1>
          </div>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Find nearby blood donation camps organized by NGOs, hospitals, and organizations. Join the noble cause and
            save lives in your community.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
              <Building2 className="w-4 h-4 mr-2" />
              {camps.filter((c) => c.organizerType === "NGO").length} NGO Camps
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
              <Target className="w-4 h-4 mr-2" />
              {camps.filter((c) => c.status === "ongoing").length} Active Camps
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
              <Users className="w-4 h-4 mr-2" />
              {camps.reduce((sum, camp) => sum + camp.registrations.length, 0)} Total Registrations
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-red-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search camps, organizers, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-red-200 focus:border-red-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={organizerFilter}
              onChange={(e) => setOrganizerFilter(e.target.value)}
              className="px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Organizers</option>
              <option value="NGO">NGO</option>
              <option value="Hospital">Hospital</option>
              <option value="Government">Government</option>
              <option value="Corporate">Corporate</option>
            </select>

            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Camps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCamps.map((camp) => {
            const isRegistered = isUserRegistered(camp)
            return (
              <Card
                key={camp._id}
                className="hover:shadow-xl transition-all duration-300 border-red-100 hover:border-red-300 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {camp.title}
                      </CardTitle>
                      <div className="flex items-center mt-2 text-gray-600">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span className="font-medium">{camp.organizer}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(camp.status)}>
                        {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                      </Badge>
                      <Badge className={getOrganizerColor(camp.organizerType)}>{camp.organizerType}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location and Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{camp.location}</p>
                        <p className="text-sm text-gray-600">{camp.address}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">{new Date(camp.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-sm">
                          {camp.startTime} - {camp.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                      <span className="text-sm text-gray-600">
                        {camp.registrations.length} / {camp.targetDonors} registered
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(camp.registrations.length, camp.targetDonors)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Blood Types */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Blood Types Needed:</p>
                    <div className="flex flex-wrap gap-2">
                      {camp.bloodTypes.map((type) => (
                        <Badge key={type} variant="outline" className="border-red-200 text-red-700">
                          <Droplets className="w-3 h-3 mr-1" />
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">{camp.description}</p>

                  {/* Requirements */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {camp.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact and Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{camp.contact.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{camp.contact.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isRegistered ? (
                        <Button size="sm" disabled className="bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Registered
                        </Button>
                      ) : (
                        <>
                          {(camp.status === "upcoming" || camp.status === "ongoing") && (
                            <Dialog open={registrationDialog} onOpenChange={setRegistrationDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedCamp(camp)}
                                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                                  disabled={!user}
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  {camp.status === "ongoing" ? "Join Now" : "Register"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Register for Camp</DialogTitle>
                                  <DialogDescription>
                                    Confirm your registration for "{selectedCamp?.title}"
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCamp && (
                                  <div className="space-y-4">
                                    <div className="bg-red-50 p-4 rounded-lg">
                                      <h4 className="font-semibold text-red-900 mb-2">Camp Details</h4>
                                      <div className="space-y-2 text-sm text-red-800">
                                        <p>
                                          <strong>Date:</strong> {new Date(selectedCamp.date).toLocaleDateString()}
                                        </p>
                                        <p>
                                          <strong>Time:</strong> {selectedCamp.startTime} - {selectedCamp.endTime}
                                        </p>
                                        <p>
                                          <strong>Location:</strong> {selectedCamp.location}
                                        </p>
                                        <p>
                                          <strong>Address:</strong> {selectedCamp.address}
                                        </p>
                                      </div>
                                    </div>

                                    {user && (
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 mb-2">Your Information</h4>
                                        <div className="space-y-2 text-sm text-blue-800">
                                          <p>
                                            <strong>Name:</strong> {user.firstName} {user.lastName}
                                          </p>
                                          <p>
                                            <strong>Blood Type:</strong> {user.bloodType}
                                          </p>
                                          <p>
                                            <strong>Email:</strong> {user.email}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                      <div className="flex items-start space-x-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                          <h4 className="font-semibold text-yellow-900 mb-1">Important Notes</h4>
                                          <ul className="text-sm text-yellow-800 space-y-1">
                                            <li>• Please bring a valid ID</li>
                                            <li>• Ensure you meet all health requirements</li>
                                            <li>• Arrive 15 minutes before your scheduled time</li>
                                            <li>• You will receive a confirmation email</li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                      <Button
                                        variant="outline"
                                        onClick={() => setRegistrationDialog(false)}
                                        disabled={isRegistering}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => handleRegister(selectedCamp._id)}
                                        disabled={isRegistering}
                                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                                      >
                                        {isRegistering ? "Registering..." : "Confirm Registration"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* No Results */}
        {filteredCamps.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No camps found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or check back later for new camps.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Want to Organize a Blood Donation Camp?</h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Join hands with us to organize blood donation camps in your community. Together, we can save more lives and
            build a stronger blood supply network.
          </p>
          <Button className="bg-white text-red-600 hover:bg-red-50 font-semibold px-8 py-3">Organize a Camp</Button>
        </div>
      </div>
    </div>
  )
}
