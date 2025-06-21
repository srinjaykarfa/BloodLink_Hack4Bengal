"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Heart,
  Droplets,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Calendar,
  Award,
  MessageCircle,
} from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"

interface Donor {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  bloodType: string
  address?: string
  donorInfo?: {
    totalDonations: number
    lastDonationDate: string
    isAvailable: boolean
  }
}

interface BloodRequest {
  _id: string
  patientName: string
  bloodType: string
  unitsNeeded: number
  urgency: "critical" | "urgent" | "moderate" | "routine"
  hospital: {
    name: string
    address: string
    contactNumber: string
  }
  contactPhone: string
  medicalReason: string
  attendingPhysician: {
    name: string
    contact: string
  }
  requestedBy: {
    _id: string
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  createdAt: string
  status: string
  responses: Array<{
    _id: string
    donor: Donor
    notes: string
    status: string
    responseDate: string
  }>
  fulfilledBy?: string
}

export default function RequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [request, setRequest] = useState<BloodRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [acceptingDonor, setAcceptingDonor] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchRequestDetails()
    }
  }, [params.id])

  const fetchRequestDetails = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching request details for ID:", params.id)

      const response = await apiClient.getBloodRequest(params.id as string)
      console.log("📋 Request details response:", response)

      setRequest(response.request)
    } catch (error: any) {
      console.error("❌ Error fetching request details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load request details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptDonor = async (donorId: string, donorName: string) => {
    try {
      setAcceptingDonor(donorId)

      await apiClient.updateRequestStatus(params.id as string, "fulfilled", donorId)

      toast({
        title: "Donor Accepted! 🎉",
        description: `You have accepted ${donorName} as your donor. Please contact them to coordinate the donation.`,
      })

      // Refresh the data
      await fetchRequestDetails()
    } catch (error: any) {
      console.error("❌ Error accepting donor:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to accept donor",
        variant: "destructive",
      })
    } finally {
      setAcceptingDonor(null)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-600 text-white"
      case "urgent":
        return "bg-orange-500 text-white"
      case "moderate":
        return "bg-yellow-500 text-white"
      case "routine":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleStartChat = (donorId: string) => {
    setSelectedDonorId(donorId)
    setShowChat(true)
  }

  if (showChat && selectedDonorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ChatInterface
          requestId={params.id as string}
          donorId={selectedDonorId}
          onClose={() => {
            setShowChat(false)
            setSelectedDonorId(null)
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="text-red-600 mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Request Not Found</h3>
            <p className="text-gray-500 mb-4">The blood request you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/dashboard")} className="bg-red-600 hover:bg-red-700">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Request Details</h1>
                <p className="text-gray-600">Patient: {request.patientName}</p>
              </div>
              <Badge className={getUrgencyColor(request.urgency)}>{request.urgency.toUpperCase()}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplets className="h-5 w-5 text-red-600 mr-2" />
                    Request Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="font-semibold text-red-600">{request.bloodType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Units Needed</p>
                      <p className="font-semibold">{request.unitsNeeded} units</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Hospital</p>
                    <p className="font-medium">{request.hospital.name}</p>
                    <p className="text-sm text-gray-600">{request.hospital.address}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Contact Phone</p>
                    <p className="font-medium">{request.contactPhone}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Attending Physician</p>
                    <p className="font-medium">Dr. {request.attendingPhysician.name}</p>
                    <p className="text-sm text-gray-600">{request.attendingPhysician.contact}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Medical Reason</p>
                    <p className="text-sm">{request.medicalReason}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm">{getTimeAgo(request.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donor Responses */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 text-red-600 mr-2" />
                    Donor Responses ({request.responses.length})
                  </CardTitle>
                  <CardDescription>Donors who are interested in helping with your blood request</CardDescription>
                </CardHeader>
                <CardContent>
                  {request.responses.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No responses yet</h3>
                      <p className="text-gray-500">We'll notify you when donors respond to your request</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {request.responses.map((response) => (
                        <Card key={response._id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {response.donor.firstName} {response.donor.lastName}
                                </h3>
                                <p className="text-sm text-gray-500">Responded {getTimeAgo(response.responseDate)}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">{response.status.toUpperCase()}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <Droplets className="h-4 w-4 text-red-500 mr-2" />
                                  <span className="font-medium text-red-600">{response.donor.bloodType}</span>
                                </div>

                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm">{response.donor.phone}</span>
                                </div>

                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm">{response.donor.email}</span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {response.donor.donorInfo && (
                                  <>
                                    <div className="flex items-center">
                                      <Award className="h-4 w-4 text-yellow-500 mr-2" />
                                      <span className="text-sm">
                                        {response.donor.donorInfo.totalDonations || 0} donations
                                      </span>
                                    </div>

                                    {response.donor.donorInfo.lastDonationDate && (
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                        <span className="text-sm">
                                          Last donated: {formatDate(response.donor.donorInfo.lastDonationDate)}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}

                                {response.donor.address && (
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{response.donor.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {response.notes && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-700">
                                  <strong>Message:</strong> {response.notes}
                                </p>
                              </div>
                            )}

                            <div className="flex space-x-3">
                              <Button
                                onClick={() => window.open(`tel:${response.donor.phone}`, "_self")}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </Button>

                              <Button
                                onClick={() => window.open(`mailto:${response.donor.email}`, "_self")}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </Button>

                              {request.status === "active" && (
                                <Button
                                  onClick={() =>
                                    handleAcceptDonor(
                                      response.donor._id,
                                      `${response.donor.firstName} ${response.donor.lastName}`,
                                    )
                                  }
                                  disabled={acceptingDonor === response.donor._id}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  {acceptingDonor === response.donor._id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Accepting...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Accept Donor
                                    </>
                                  )}
                                </Button>
                              )}

                              {request.status === "fulfilled" && request.fulfilledBy === response.donor._id && (
                                <Button
                                  onClick={() => handleStartChat(response.donor._id)}
                                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                  size="sm"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Chat
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {request.status === "fulfilled" && (
                <Alert className="mt-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ This request has been fulfilled! Thank you for using E-Blood Link.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
