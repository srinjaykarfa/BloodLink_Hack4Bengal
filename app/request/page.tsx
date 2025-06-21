"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MapPin, Phone, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import apiClient from "@/lib/api"

export default function RequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    contactPhone: "",
    bloodType: "",
    unitsNeeded: "",
    urgency: "",
    hospital: "",
    medicalReason: "",
    attendingPhysician: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a blood request",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Validate form
    const requiredFields = [
      "patientName",
      "contactPhone",
      "bloodType",
      "unitsNeeded",
      "urgency",
      "hospital",
      "medicalReason",
      "attendingPhysician",
    ]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const requestData = {
        patientName: formData.patientName,
        bloodType: formData.bloodType,
        unitsNeeded: Number.parseInt(formData.unitsNeeded),
        urgency: formData.urgency,
        hospital: {
          name: formData.hospital,
          address: formData.hospital,
          contactNumber: formData.contactPhone,
        },
        contactPhone: formData.contactPhone,
        medicalReason: formData.medicalReason,
        attendingPhysician: {
          name: formData.attendingPhysician,
          contact: formData.contactPhone,
        },
      }

      const response = await apiClient.createBloodRequest(requestData)

      toast({
        title: "Request Submitted Successfully!",
        description: `Found ${response.matchingDonors} potential donors. They will be notified.`,
      })

      // Reset form
      setFormData({
        patientName: "",
        contactPhone: "",
        bloodType: "",
        unitsNeeded: "",
        urgency: "",
        hospital: "",
        medicalReason: "",
        attendingPhysician: "",
      })

      // Redirect to dashboard or requests page
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Submit request error:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit blood request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Request Blood</h1>
            <p className="text-gray-600">Submit an urgent blood request to our donor network</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                    Blood Request Form
                  </CardTitle>
                  <CardDescription>Fill out all required information for your blood request</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patientName">Patient Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="patientName"
                            placeholder="Enter patient name"
                            className="pl-10"
                            value={formData.patientName}
                            onChange={(e) => handleInputChange("patientName", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="contactPhone"
                            type="tel"
                            placeholder="Emergency contact"
                            className="pl-10"
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Required Blood Type *</Label>
                        <Select
                          value={formData.bloodType}
                          onValueChange={(value) => handleInputChange("bloodType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
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
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="units">Units Needed *</Label>
                        <Input
                          id="units"
                          type="number"
                          placeholder="Number of units"
                          min="1"
                          max="10"
                          value={formData.unitsNeeded}
                          onChange={(e) => handleInputChange("unitsNeeded", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency Level *</Label>
                        <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical (0-2 hours)</SelectItem>
                            <SelectItem value="urgent">Urgent (2-6 hours)</SelectItem>
                            <SelectItem value="moderate">Moderate (6-24 hours)</SelectItem>
                            <SelectItem value="routine">Routine (24+ hours)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hospital">Hospital/Medical Center *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="hospital"
                          placeholder="Enter hospital name and address"
                          className="pl-10"
                          value={formData.hospital}
                          onChange={(e) => handleInputChange("hospital", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Medical Reason *</Label>
                      <Textarea
                        id="reason"
                        placeholder="Brief description of why blood is needed (surgery, accident, etc.)"
                        rows={3}
                        value={formData.medicalReason}
                        onChange={(e) => handleInputChange("medicalReason", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctorName">Attending Physician *</Label>
                      <Input
                        id="doctorName"
                        placeholder="Doctor's name and contact"
                        value={formData.attendingPhysician}
                        onChange={(e) => handleInputChange("attendingPhysician", e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-5 w-5 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mr-2 h-5 w-5" />
                          Submit Blood Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Emergency Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Response Time</h4>
                      <p className="text-sm text-gray-600">Critical requests are processed within 30 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Emergency Hotline</h4>
                      <p className="text-sm text-gray-600">Call +1-800-BLOOD-911 for immediate assistance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Coverage Area</h4>
                      <p className="text-sm text-gray-600">We serve all major hospitals in the metropolitan area</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-semibold">O- Blood</div>
                        <div className="text-sm text-gray-600">City Hospital</div>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-semibold">A+ Blood</div>
                        <div className="text-sm text-gray-600">General Medical</div>
                      </div>
                      <Badge className="bg-yellow-600">Urgent</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-semibold">B+ Blood</div>
                        <div className="text-sm text-gray-600">Metro Hospital</div>
                      </div>
                      <Badge className="bg-green-600">Fulfilled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
