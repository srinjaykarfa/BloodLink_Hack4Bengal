"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Building2,
  Eye,
  UserCheck,
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
  createdAt: string
  updatedAt: string
}

const initialCampData = {
  title: "",
  organizer: "",
  organizerType: "NGO" as const,
  location: "",
  address: "",
  date: "",
  startTime: "",
  endTime: "",
  targetDonors: 100,
  bloodTypes: [],
  contact: {
    phone: "",
    email: "",
  },
  description: "",
  requirements: [],
}

export default function AdminCampsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [camps, setCamps] = useState<Camp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null)
  const [formData, setFormData] = useState(initialCampData)
  const [selectedBloodTypes, setSelectedBloodTypes] = useState<string[]>([])
  const [requirements, setRequirements] = useState<string>("")

  const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  useEffect(() => {
    if (!loading && (!user || user.userType !== "admin")) {
      router.push("/login")
      return
    }
    if (user?.userType === "admin") {
      fetchCamps()
    }
  }, [user, loading, router])

  const fetchCamps = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call
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
          registrations: [
            {
              userId: "user1",
              userName: "John Doe",
              userEmail: "john@example.com",
              bloodType: "A+",
              registeredAt: "2024-01-10T10:00:00Z",
              status: "registered",
            },
            {
              userId: "user2",
              userName: "Jane Smith",
              userEmail: "jane@example.com",
              bloodType: "O+",
              registeredAt: "2024-01-11T14:30:00Z",
              status: "attended",
            },
          ],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-12T12:00:00Z",
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
          createdAt: "2024-01-05T00:00:00Z",
          updatedAt: "2024-01-05T00:00:00Z",
        },
      ]
      setCamps(mockCamps)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch camps",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const campData = {
        ...formData,
        bloodTypes: selectedBloodTypes,
        requirements: requirements
          .split(",")
          .map((req) => req.trim())
          .filter(Boolean),
      }

      if (editingCamp) {
        // Update camp
        toast({
          title: "Success",
          description: "Camp updated successfully",
        })
      } else {
        // Create new camp
        toast({
          title: "Success",
          description: "Camp created successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchCamps()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save camp",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (camp: Camp) => {
    setEditingCamp(camp)
    setFormData({
      title: camp.title,
      organizer: camp.organizer,
      organizerType: camp.organizerType,
      location: camp.location,
      address: camp.address,
      date: camp.date,
      startTime: camp.startTime,
      endTime: camp.endTime,
      targetDonors: camp.targetDonors,
      bloodTypes: camp.bloodTypes,
      contact: camp.contact,
      description: camp.description,
      requirements: camp.requirements,
    })
    setSelectedBloodTypes(camp.bloodTypes)
    setRequirements(camp.requirements.join(", "))
    setIsDialogOpen(true)
  }

  const handleDelete = async (campId: string) => {
    if (confirm("Are you sure you want to delete this camp?")) {
      try {
        toast({
          title: "Success",
          description: "Camp deleted successfully",
        })
        fetchCamps()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete camp",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData(initialCampData)
    setSelectedBloodTypes([])
    setRequirements("")
    setEditingCamp(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrganizerColor = (type: string) => {
    switch (type) {
      case "NGO":
        return "bg-red-100 text-red-800"
      case "Hospital":
        return "bg-blue-100 text-blue-800"
      case "Government":
        return "bg-green-100 text-green-800"
      case "Corporate":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || user.userType !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Camp Management</h1>
            <p className="text-gray-600 mt-2">Manage blood donation camps and registrations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Camp
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCamp ? "Edit Camp" : "Create New Camp"}</DialogTitle>
                <DialogDescription>
                  {editingCamp ? "Update camp information" : "Fill in the details to create a new blood donation camp"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Camp Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter camp title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Organizer</label>
                    <Input
                      value={formData.organizer}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      placeholder="Organization name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Organizer Type</label>
                    <select
                      value={formData.organizerType}
                      onChange={(e) => setFormData({ ...formData, organizerType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="NGO">NGO</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Government">Government</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Donors</label>
                    <Input
                      type="number"
                      value={formData.targetDonors}
                      onChange={(e) => setFormData({ ...formData, targetDonors: Number.parseInt(e.target.value) })}
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Venue name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Phone</label>
                    <Input
                      value={formData.contact.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })
                      }
                      placeholder="+880-1234-567890"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <Input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })
                      }
                      placeholder="contact@organization.org"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Blood Types Needed</label>
                  <div className="grid grid-cols-4 gap-2">
                    {bloodTypeOptions.map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedBloodTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBloodTypes([...selectedBloodTypes, type])
                            } else {
                              setSelectedBloodTypes(selectedBloodTypes.filter((t) => t !== type))
                            }
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the camp and its purpose"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Requirements (comma-separated)</label>
                  <Input
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Age 18-60, Weight 50kg+, Good Health, Valid ID"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  >
                    {editingCamp ? "Update Camp" : "Create Camp"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Camps</p>
                  <p className="text-2xl font-bold text-gray-900">{camps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Camps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {camps.filter((c) => c.status === "ongoing").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {camps.reduce((sum, camp) => sum + camp.registrations.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">NGO Camps</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {camps.filter((c) => c.organizerType === "NGO").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Camps Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Camps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {camps.map((camp) => (
                <div key={camp._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{camp.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {camp.organizer}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {camp.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(camp.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(camp.status)}>
                        {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                      </Badge>
                      <Badge className={getOrganizerColor(camp.organizerType)}>{camp.organizerType}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span>
                        {camp.currentDonors} / {camp.targetDonors} donors
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{camp.registrations.length} registrations</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span>
                        {camp.startTime} - {camp.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Created: {new Date(camp.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/camps/${camp._id}`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(camp)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(camp._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {camps.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No camps found</h3>
                <p className="text-gray-500 mb-4">Create your first blood donation camp to get started.</p>
                <Button
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(true)
                  }}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Camp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
