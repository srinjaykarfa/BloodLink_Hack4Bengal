"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { Search, MapPin, Phone, Mail, Heart, Loader2 } from "lucide-react"

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

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    bloodType: "all",
    city: "all",
    available: "all",
    search: "",
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  })

  const { toast } = useToast()

  const fetchDonors = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: pagination.current,
        limit: 12,
      }

      if (filters.bloodType !== "all") params.bloodType = filters.bloodType
      if (filters.city !== "all") params.city = filters.city
      if (filters.available !== "all") params.available = filters.available
      if (filters.search) params.search = filters.search

      const response = await apiClient.getDonors(params)
      setDonors(response.donors)
      setPagination(response.pagination)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch donors",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonors()
  }, [filters, pagination.current])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchDonors()
  }

  const formatLastDonation = (date?: string) => {
    if (!date) return "Never"
    const donationDate = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - donationDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="h-16 w-16 text-red-600 mx-auto mb-4 fill-current" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Blood Donors</h1>
            <p className="text-gray-600">Connect with verified blood donors in your area</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Donors</CardTitle>
              <CardDescription>Filter donors by blood type and location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or location"
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select
                  value={filters.bloodType}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, bloodType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.city}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="downtown">Downtown</SelectItem>
                    <SelectItem value="midtown">Midtown</SelectItem>
                    <SelectItem value="uptown">Uptown</SelectItem>
                    <SelectItem value="westside">Westside</SelectItem>
                    <SelectItem value="eastside">Eastside</SelectItem>
                    <SelectItem value="southside">Southside</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.available}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, available: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Donors</SelectItem>
                    <SelectItem value="true">Available Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Loading donors...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map((donor) => (
                  <Card key={donor._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                            {donor.firstName[0]}
                            {donor.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {donor.firstName} {donor.lastName}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={donor.bloodType.includes("-") ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {donor.bloodType}
                            </Badge>
                            <Badge
                              variant={donor.donorInfo.isAvailable ? "default" : "secondary"}
                              className={donor.donorInfo.isAvailable ? "bg-green-600" : ""}
                            >
                              {donor.donorInfo.isAvailable ? "Available" : "Not Available"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {donor.address.city}, {donor.address.state}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {donor.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {donor.email}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last donation:</span>
                        <span className="font-medium">{formatLastDonation(donor.donorInfo.lastDonationDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total donations:</span>
                        <span className="font-medium text-red-600">{donor.donorInfo.totalDonations}</span>
                      </div>
                      <div className="pt-2">
                        <Button
                          className="w-full"
                          variant={donor.donorInfo.isAvailable ? "default" : "secondary"}
                          disabled={!donor.donorInfo.isAvailable}
                        >
                          {donor.donorInfo.isAvailable ? "Contact Donor" : "Currently Unavailable"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {donors.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No donors found</h3>
                  <p className="text-gray-500">Try adjusting your search filters</p>
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <Button
                    variant="outline"
                    disabled={pagination.current === 1}
                    onClick={() => setPagination((prev) => ({ ...prev, current: prev.current - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.current} of {pagination.pages} ({pagination.total} total donors)
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.current === pagination.pages}
                    onClick={() => setPagination((prev) => ({ ...prev, current: prev.current + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
