"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Heart, User, Phone, Mail, MapPin, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [userType, setUserType] = useState<"donor" | "recipient" | "">("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    bloodType: "",
    age: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    donorInfo: {
      isAvailable: true,
      lastDonationDate: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
  })

  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) {
      toast({
        title: "Error",
        description: "Please select whether you're a donor or recipient",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await register({
        ...formData,
        userType,
        age: Number.parseInt(formData.age),
        donorInfo: userType === "donor" ? formData.donorInfo : undefined,
      })

      toast({
        title: "Success!",
        description: "Account created successfully. Welcome to E-Blood Link!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="h-16 w-16 text-red-600 mx-auto mb-4 fill-current" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Join E-Blood Link</h1>
            <p className="text-gray-600">Register as a donor or recipient to save lives</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration Form</CardTitle>
              <CardDescription>Fill out the form below to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${userType === "donor" ? "ring-2 ring-red-600 bg-red-50" : "hover:bg-gray-50"}`}
                    onClick={() => setUserType("donor")}
                  >
                    <CardContent className="p-4 text-center">
                      <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Blood Donor</h3>
                      <p className="text-sm text-gray-600">Donate blood to save lives</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all ${userType === "recipient" ? "ring-2 ring-red-600 bg-red-50" : "hover:bg-gray-50"}`}
                    onClick={() => setUserType("recipient")}
                  >
                    <CardContent className="p-4 text-center">
                      <User className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Blood Recipient</h3>
                      <p className="text-sm text-gray-600">Request blood when needed</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type *</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
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
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      min="18"
                      max="65"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="street"
                      placeholder="Enter your street address"
                      className="pl-10"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange("address.street", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange("address.city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Enter your state"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange("address.state", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      placeholder="Enter ZIP code"
                      value={formData.address.zipCode}
                      onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {userType === "donor" && (
                  <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                    <h3 className="font-semibold text-red-800">Donor Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="lastDonation">Last Donation Date (if any)</Label>
                      <Input
                        id="lastDonation"
                        type="date"
                        value={formData.donorInfo.lastDonationDate}
                        onChange={(e) => handleInputChange("donorInfo.lastDonationDate", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={formData.donorInfo.isAvailable}
                        onCheckedChange={(checked) => handleInputChange("donorInfo.isAvailable", checked)}
                      />
                      <Label htmlFor="available" className="text-sm">
                        I am available for emergency blood donations
                      </Label>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms of Service and Privacy Policy *
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifications" />
                    <Label htmlFor="notifications" className="text-sm">
                      Send me notifications about blood requests in my area
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
