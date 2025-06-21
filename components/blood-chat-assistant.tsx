"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Send, X, MessageCircle, Droplets, MapPin, Phone, Mail, Bot, User, Loader2 } from "lucide-react"

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

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
  donors?: Donor[]
  isTyping?: boolean
}

interface BloodChatAssistantProps {
  onClose: () => void
}

export function BloodChatAssistant({ onClose }: BloodChatAssistantProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: 'Hello! 👋 I\'m your Blood Donor Assistant. You can ask me to find donors by typing messages like:\n\n• "I need A+ blood in Kolkata"\n• "Looking for O- donors in Mumbai"\n• "Need B+ blood urgently in Delhi"\n\nHow can I help you today?',
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Parse message to extract blood type and location
  const parseMessage = (message: string) => {
    const bloodTypes = [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
      "O negative",
      "O positive",
      "A positive",
      "A negative",
      "B positive",
      "B negative",
      "AB positive",
      "AB negative",
    ]
    const cities = [
      "kolkata",
      "mumbai",
      "delhi",
      "chennai",
      "bangalore",
      "hyderabad",
      "pune",
      "ahmedabad",
      "jaipur",
      "lucknow",
      "kanpur",
      "nagpur",
      "indore",
      "thane",
      "bhopal",
      "visakhapatnam",
      "pimpri",
      "patna",
      "vadodara",
      "ghaziabad",
      "ludhiana",
      "agra",
      "nashik",
      "faridabad",
      "meerut",
      "rajkot",
      "kalyan",
      "vasai",
      "varanasi",
      "srinagar",
      "aurangabad",
      "dhanbad",
      "amritsar",
      "navi mumbai",
      "allahabad",
      "ranchi",
      "howrah",
      "coimbatore",
      "jabalpur",
      "gwalior",
      "vijayawada",
      "jodhpur",
      "madurai",
      "raipur",
      "kota",
      "guwahati",
      "chandigarh",
      "solapur",
      "hubli",
      "tiruchirappalli",
      "bareilly",
      "mysore",
      "tiruppur",
      "gurgaon",
      "aligarh",
      "jalandhar",
      "bhubaneswar",
      "salem",
      "warangal",
      "guntur",
      "bhiwandi",
      "saharanpur",
      "gorakhpur",
      "bikaner",
      "amravati",
      "noida",
      "jamshedpur",
      "bhilai",
      "cuttack",
      "firozabad",
      "kochi",
      "nellore",
      "bhavnagar",
      "dehradun",
      "durgapur",
      "asansol",
      "rourkela",
      "nanded",
      "kolhapur",
      "ajmer",
      "akola",
      "gulbarga",
      "jamnagar",
      "ujjain",
      "loni",
      "siliguri",
      "jhansi",
      "ulhasnagar",
      "jammu",
      "sangli",
      "mangalore",
      "erode",
      "belgaum",
      "ambattur",
      "tirunelveli",
      "malegaon",
      "gaya",
      "jalgaon",
      "udaipur",
      "maheshtala",
    ]

    let foundBloodType = ""
    let foundLocation = ""

    // Find blood type
    for (const bloodType of bloodTypes) {
      if (message.toLowerCase().includes(bloodType.toLowerCase())) {
        // Convert full names to symbols
        if (bloodType.toLowerCase().includes("positive")) {
          foundBloodType = bloodType.replace(/positive/i, "+").replace(/\s/g, "")
        } else if (bloodType.toLowerCase().includes("negative")) {
          foundBloodType = bloodType.replace(/negative/i, "-").replace(/\s/g, "")
        } else {
          foundBloodType = bloodType
        }
        break
      }
    }

    // Find location
    for (const city of cities) {
      if (message.toLowerCase().includes(city.toLowerCase())) {
        foundLocation = city.charAt(0).toUpperCase() + city.slice(1)
        break
      }
    }

    return { bloodType: foundBloodType, location: foundLocation }
  }

  const searchDonors = async (bloodType: string, location?: string) => {
    try {
      const params: any = {
        bloodType,
        available: "true",
      }

      if (location) {
        params.city = location
      }

      const response = await apiClient.getDonors(params)
      return response.donors || []
    } catch (error) {
      console.error("Error searching donors:", error)
      return []
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      text: "Assistant is typing...",
      sender: "assistant",
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages((prev) => [...prev, typingMessage])

    // Parse the message
    const { bloodType, location } = parseMessage(inputMessage)

    setTimeout(async () => {
      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"))

      if (!bloodType) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          text: 'I couldn\'t find a blood type in your message. Please specify a blood type like A+, B-, O+, AB-, etc.\n\nFor example: "I need A+ blood in Kolkata"',
          sender: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
        return
      }

      // Search for donors
      const donors = await searchDonors(bloodType, location)

      let responseText = ""
      if (donors.length === 0) {
        responseText = `Sorry, I couldn't find any available donors for ${bloodType} blood${location ? ` in ${location}` : ""}. 😔\n\nTry searching in nearby areas or check back later.`
      } else {
        responseText = `Great! I found ${donors.length} available donor${donors.length > 1 ? "s" : ""} for ${bloodType} blood${location ? ` in ${location}` : ""}! 🩸\n\nHere are the details:`
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        sender: "assistant",
        timestamp: new Date(),
        donors: donors.length > 0 ? donors : undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
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
      await apiClient.createGeneralChat(donor._id)
      toast({
        title: "Chat started! 💬",
        description: `You can now chat with ${donor.firstName} ${donor.lastName}`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to start chat",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    }
  }

  const quickMessages = [
    "I need A+ blood in Kolkata",
    "Looking for O- donors in Mumbai",
    "Need B+ blood urgently in Delhi",
    "Want AB+ blood in Chennai",
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <Bot className="h-6 w-6 mr-2" />
              Blood Donor Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        className={message.sender === "user" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}
                      >
                        {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : message.isTyping
                            ? "bg-gray-100 text-gray-600"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-line">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Donor Cards */}
              {messages.map(
                (message) =>
                  message.donors &&
                  message.donors.length > 0 && (
                    <div key={`donors-${message.id}`} className="space-y-3">
                      {message.donors.map((donor) => (
                        <Card key={donor._id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
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
                                      {donor.donorInfo.totalDonations} donations
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2 min-w-[80px]">
                                <Button
                                  onClick={() => handleStartChat(donor)}
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                  size="sm"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Chat
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
                  ),
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Messages */}
            {messages.length === 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {quickMessages.map((msg, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(msg)}
                      className="text-xs"
                    >
                      {msg}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message... (e.g., I need A+ blood in Kolkata)"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
