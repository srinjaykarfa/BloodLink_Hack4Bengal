"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Heart, Droplets, Clock, MapPin, Phone, User, CheckCircle, Loader2, Bell, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"

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
  responses: Array<{
    donor: string
    notes: string
    status: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [matchingRequests, setMatchingRequests] = useState<BloodRequest[]>([])
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  // Add this new state at the top with other states
  const [myResponses, setMyResponses] = useState<any[]>([])
  const [showChat, setShowChat] = useState(false)
  const [selectedChat, setSelectedChat] = useState<{ requestId: string; donorId: string } | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      console.log("🔍 Current user:", user)
      fetchDashboardData()
    } else if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("📊 Fetching dashboard data...")

      if (user?.userType === "donor") {
        console.log("🩸 Fetching matching requests for donor:", user.bloodType)
        try {
          const matchingResponse = await apiClient.getMatchingRequests()
          console.log("📋 Matching requests response:", matchingResponse)
          setMatchingRequests(matchingResponse.requests || [])
        } catch (matchingError) {
          console.error("❌ Error fetching matching requests:", matchingError)
          // Don't fail the whole dashboard if matching requests fail
          setMatchingRequests([])
        }
      }

      // Add this API call in fetchDashboardData function after fetching matching requests
      if (user?.userType === "donor") {
        try {
          const responsesResponse = await apiClient.getMyResponses()
          console.log("📋 My responses:", responsesResponse)
          setMyResponses(responsesResponse.responses || [])
        } catch (responsesError) {
          console.error("❌ Error fetching my responses:", responsesError)
          setMyResponses([])
        }
      }

      // Fetch user's own requests
      console.log("📝 Fetching user's own requests")
      try {
        const myRequestsResponse = await apiClient.getMyRequests()
        console.log("📋 My requests response:", myRequestsResponse)
        setMyRequests(myRequestsResponse.requests || [])
      } catch (myRequestsError) {
        console.error("❌ Error fetching my requests:", myRequestsError)
        // Don't fail the whole dashboard if my requests fail
        setMyRequests([])
      }
    } catch (error: any) {
      console.error("❌ Dashboard fetch error:", error)
      setError(error.message || "Failed to load dashboard data")
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, notes?: string) => {
    console.log("🔄 Responding to request:", requestId)
    console.log("👤 Current user ID:", user?.id)

    setResponding(requestId)
    try {
      const response = await apiClient.respondToRequest(requestId, notes || "I am available to donate blood")
      console.log("✅ Response successful:", response)

      toast({
        title: "Response Sent! 🎉",
        description: "Your interest has been recorded. The requester will contact you soon.",
      })

      // Refresh the data
      await fetchDashboardData()
    } catch (error: any) {
      console.error("❌ Response error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      })
    } finally {
      setResponding(null)
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

  const hasUserResponded = (request: BloodRequest) => {
    const userResponse = request.responses.find((response) => {
      console.log("🔍 Checking response:", response.donor, "vs user:", user?.id)
      return response.donor === user?.id || response.donor === user?._id
    })
    console.log("🤔 Has user responded?", !!userResponse)
    return !!userResponse
  }

  const handleStartChat = (requestId: string, donorId: string) => {
    setSelectedChat({ requestId, donorId })
    setShowChat(true)
  }

  if (showChat && selectedChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <ChatInterface
          requestId={selectedChat.requestId}
          donorId={selectedChat.donorId}
          onClose={() => {
            setShowChat(false)
            setSelectedChat(null)
          }}
        />
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="text-red-600 mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="bg-red-600 hover:bg-red-700">
              Try Again
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.firstName}! 👋</h1>
            <p className="text-gray-600">
              {user.userType === "donor"
                ? `Blood Type: ${user.bloodType} • Ready to save lives today?`
                : "Manage your blood requests and account"}
            </p>
          </div>

          {/* Donor Matching Requests */}
          {user.userType === "donor" && (
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Bell className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Matching Blood Requests ({matchingRequests.length})
                </h2>
              </div>

              {matchingRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No matching requests right now</h3>
                    <p className="text-gray-500">
                      We'll notify you when someone needs your blood type ({user.bloodType})
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {matchingRequests.map((request) => {
                    const alreadyResponded = hasUserResponded(request)

                    return (
                      <Card key={request._id} className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center">
                                <Droplets className="h-5 w-5 text-red-600 mr-2" />
                                {request.patientName}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Requested by: {request.requestedBy.firstName} {request.requestedBy.lastName}
                              </CardDescription>
                            </div>
                            <Badge className={getUrgencyColor(request.urgency)}>{request.urgency.toUpperCase()}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <Droplets className="h-4 w-4 text-red-500 mr-2" />
                              <span className="font-semibold">{request.bloodType}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">{request.unitsNeeded} units needed</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {request.hospital.name}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {request.contactPhone}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              Dr. {request.attendingPhysician.name}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {getTimeAgo(request.createdAt)}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Medical Reason:</strong> {request.medicalReason}
                            </p>
                          </div>

                          {/* Response section */}
                          {alreadyResponded ? (
                            <Alert>
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>
                                ✅ You have already responded to this request. The requester will contact you soon.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleRespondToRequest(request._id)}
                                disabled={responding === request._id}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                              >
                                {responding === request._id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Responding...
                                  </>
                                ) : (
                                  <>
                                    <Heart className="mr-2 h-4 w-4" />I Can Help!
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  window.open(`tel:${request.contactPhone}`, "_self")
                                }}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* My Accepted Responses - Show after matching requests */}
          {user.userType === "donor" && myResponses.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">My Response Status ({myResponses.length})</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myResponses.map((response) => {
                  const isAccepted = response.request.status === "fulfilled" && response.request.fulfilledBy === user.id
                  const isPending = response.request.status === "active"

                  return (
                    <Card
                      key={response._id}
                      className={`border-l-4 ${isAccepted ? "border-l-green-500 bg-green-50" : isPending ? "border-l-yellow-500" : "border-l-gray-300"}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              <Droplets className="h-5 w-5 text-red-600 mr-2" />
                              {response.request.patientName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Responded {getTimeAgo(response.responseDate)}
                            </CardDescription>
                          </div>
                          <Badge
                            className={
                              isAccepted
                                ? "bg-green-600 text-white"
                                : isPending
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-500 text-white"
                            }
                          >
                            {isAccepted ? "ACCEPTED ✅" : isPending ? "PENDING" : "COMPLETED"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 text-red-500 mr-2" />
                            <span className="font-semibold">{response.request.bloodType}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">{response.request.unitsNeeded} units needed</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {response.request.hospital.name}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {response.request.contactPhone}
                          </div>
                        </div>

                        {isAccepted && (
                          <Alert className="border-green-200 bg-green-100">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              🎉 Congratulations! Your response has been accepted. Please contact the requester to
                              coordinate the donation.
                            </AlertDescription>
                          </Alert>
                        )}

                        {response.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Your message:</strong> {response.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              window.open(`tel:${response.request.contactPhone}`, "_self")
                            }}
                            className="flex-1"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Requester
                          </Button>
                          {isAccepted && (
                            <Button
                              onClick={() => handleStartChat(response.request._id, user?.id!)}
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat with Recipient
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* My Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Blood Requests ({myRequests.length})</h2>

            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Droplets className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No requests yet</h3>
                  <p className="text-gray-500 mb-4">Create a blood request to get help from donors</p>
                  <Button onClick={() => router.push("/request")} className="bg-red-600 hover:bg-red-700">
                    Create Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myRequests.map((request) => (
                  <Card key={request._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{request.patientName}</CardTitle>
                          <CardDescription>Created {getTimeAgo(request.createdAt)}</CardDescription>
                        </div>
                        <Badge className={getUrgencyColor(request.urgency)}>{request.urgency.toUpperCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 text-red-500 mr-2" />
                          <span className="font-semibold">{request.bloodType}</span>
                        </div>
                        <div>
                          <span className="font-medium">{request.unitsNeeded} units</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Responses:</strong> {request.responses.length} donors interested
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/request/${request._id}`)}
                      >
                        View Details & Responses
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
