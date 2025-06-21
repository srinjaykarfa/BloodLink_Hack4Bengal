"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, X, MessageCircle, Droplets, MapPin, Phone, Mail, User, Loader2 } from "lucide-react"
import { ChatInterface } from "./chat-interface"

interface Donor {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  bloodType: string
  address: {
    city: string
    state: string
  }
  donorInfo: {
    isAvailable: boolean
    totalDonations: number
    lastDonationDate?: string
  }
}

interface DonorChatSearchProps {
  onClose: () => void
}

export function DonorChatSearch({ onClose }: DonorChatSearchProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [bloodType, setBloodType] = useState("")
  const [location, setLocation] = useState("")
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null)

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const handleSearch = async () => {
    if (!bloodType) {
      toast({
        title: "Please select blood type",
        description: "Blood type is required to search for donors",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSearchPerformed(true)

    try {
      const params: any = {
        bloodType,
        available: "true", // Only show available donors
      }

      if (location.trim()) {
        params.city = location.trim()
      }

      const response = await apiClient.getDonors(params)
      setDonors(response.donors || [])

      if (response.donors?.length === 0) {
        toast({
          title: "No donors found",
          description: `No available donors found for blood type ${bloodType}${location ? ` in ${location}` : ""}`,
        })
      }
    } catch (error: any) {
      console.error("❌ Error searching donors:", error)
      toast({
        title: "Search failed",
        description: "Failed to search for donors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (donor: Donor) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to start a chat",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a general chat (not tied to a specific blood request)
      const response = await apiClient.createGeneralChat(donor._id)
      setSelectedDonor(donor)
      setShowChat(true)

      toast({
        title: "Chat started! 💬",
        description: `You can now chat with ${donor.firstName} ${donor.lastName}`,
      })
    } catch (error: any) {
      console.error("❌ Error starting chat:", error)
      toast({
        title: "Failed to start chat",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    }
  }

  const getLastDonationText = (lastDonationDate?: string) => {
    if (!lastDonationDate) return "First time donor"

    const date = new Date(lastDonationDate)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 30) return `Last donated ${diffInDays} days ago`
    if (diffInDays < 365) return `Last donated ${Math.floor(diffInDays / 30)} months ago`
    return `Last donated ${Math.floor(diffInDays / 365)} years ago`
  }

  if (showChat && selectedDonor) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-2xl">
          <ChatInterface
            donorId={selectedDonor._id}
            recipientId={user?.id || ""}
            onClose={() => {
              setShowChat(false)
              setSelectedDonor(null)
            }}
            chatType="general"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Find Donors to Chat
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Search Form */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type <span className="text-red-500">*</span>
                </label>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                <Input placeholder="Enter city name" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={loading || !bloodType}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Donors
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchPerformed && !loading && (
              <>
                {donors.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No donors found</h3>
                    <p className="text-gray-500">Try searching with different criteria or check back later</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Found {donors.length} available donor{donors.length !== 1 ? "s" : ""}
                    </h3>

                    {donors.map((donor) => (
                      <Card key={donor._id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                                  {donor.firstName[0]}
                                  {donor.lastName[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {donor.firstName} {donor.lastName}
                                  </h4>
                                  <Badge className="bg-red-100 text-red-800">
                                    <Droplets className="h-3 w-3 mr-1" />
                                    {donor.bloodType}
                                  </Badge>
                                  {donor.donorInfo.isAvailable && (
                                    <Badge className="bg-green-100 text-green-800">Available</Badge>
                                  )}
                                </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {donor.address.city}, {donor.address.state}
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {donor.phone}
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {donor.email}
                                  </div>
                                </div>

                                <div className="mt-2 text-sm">
                                  <span className="font-medium text-gray-700">
                                    {donor.donorInfo.totalDonations} donations •{" "}
                                    {getLastDonationText(donor.donorInfo.lastDonationDate)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                              <Button
                                onClick={() => handleStartChat(donor)}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                size="sm"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Start Chat
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`tel:${donor.phone}`, "_self")}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
