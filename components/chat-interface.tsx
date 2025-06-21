"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Send, X, Phone, Mail, Droplets, User, Check, CheckCheck, Clock } from "lucide-react"

interface Message {
  _id: string
  sender: {
    _id: string
    firstName: string
    lastName: string
  }
  message: string
  timestamp: string
  status: "sent" | "delivered" | "seen"
}

interface Chat {
  _id: string
  donor: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    bloodType: string
  }
  recipient: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  request?: {
    _id: string
    patientName: string
    bloodType: string
    unitsNeeded: number
    urgency: string
  }
  messages: Message[]
  lastActivity: string
  chatType: "request" | "general"
}

interface ChatInterfaceProps {
  requestId?: string
  donorId: string
  recipientId?: string
  onClose: () => void
  chatType?: "request" | "general"
}

export function ChatInterface({ requestId, donorId, recipientId, onClose, chatType = "request" }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChat()
  }, [requestId, donorId, recipientId, chatType])

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  useEffect(() => {
    if (chat) {
      markMessagesAsSeen()
    }
  }, [chat])

  const initializeChat = async () => {
    try {
      setLoading(true)
      console.log("🔄 Initializing chat:", { requestId, donorId, recipientId, chatType })

      if (chatType === "general") {
        // For general chats, try to get existing chat or create new one
        try {
          const response = await apiClient.getGeneralChat(donorId, recipientId || user?.id || "")
          setChat(response.chat)
        } catch (error: any) {
          if (error.message.includes("Chat not found")) {
            console.log("💬 Creating new general chat")
            const createResponse = await apiClient.createGeneralChat(donorId, recipientId)
            setChat(createResponse.chat)
          } else {
            throw error
          }
        }
      } else {
        // Original request-based chat logic
        try {
          const response = await apiClient.getChat(`request/${requestId}/donor/${donorId}`)
          setChat(response.chat)
        } catch (error: any) {
          if (error.message.includes("Chat not found")) {
            console.log("💬 Creating new request chat")
            const createResponse = await apiClient.createChat(requestId!, donorId)
            setChat(createResponse.chat)
          } else {
            throw error
          }
        }
      }
    } catch (error: any) {
      console.error("❌ Error initializing chat:", error)
      toast({
        title: "Error",
        description: "Failed to load chat. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const markMessagesAsSeen = async () => {
    if (!chat || !user) return

    try {
      await apiClient.markMessagesAsRead(chat._id)

      setChat((prevChat) => {
        if (!prevChat) return null

        const updatedMessages = prevChat.messages.map((msg) => {
          if (msg.sender._id !== user.id && msg.status !== "seen") {
            return { ...msg, status: "seen" as const }
          }
          return msg
        })

        return { ...prevChat, messages: updatedMessages }
      })
    } catch (error) {
      console.error("❌ Error marking messages as seen:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending || !chat) return

    try {
      setSending(true)
      const response = await apiClient.sendMessage(chat._id, message.trim())

      setChat((prevChat) => {
        if (!prevChat) return null
        return {
          ...prevChat,
          messages: [...prevChat.messages, response.message],
          lastActivity: new Date().toISOString(),
        }
      })

      setMessage("")

      toast({
        title: "Message sent! 💬",
        description: "Your message has been delivered.",
      })
    } catch (error: any) {
      console.error("❌ Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const getMessageStatusIcon = (message: Message) => {
    if (message.sender._id !== user?.id) return null

    switch (message.status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "seen":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-300" />
    }
  }

  const otherUser = chat && user ? (user.id === chat.donor._id ? chat.recipient : chat.donor) : null

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </Card>
    )
  }

  if (!chat || !otherUser) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex items-center justify-center">
        <div className="text-center">
          <X className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Chat not available</h3>
          <p className="text-gray-500 mb-4">Unable to load chat. Please try again.</p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-2xl border-0">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarFallback className="bg-white text-red-500 font-semibold">
                {otherUser.firstName[0]}
                {otherUser.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {otherUser.firstName} {otherUser.lastName}
              </CardTitle>
              <div className="flex items-center text-sm text-red-100">
                <Droplets className="h-3 w-3 mr-1" />
                {chatType === "request" && chat.request
                  ? `${chat.request.patientName} • ${chat.request.bloodType}`
                  : `Blood Type: ${otherUser.bloodType || "N/A"}`}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.open(`tel:${otherUser.phone}`, "_self")}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.open(`mailto:${otherUser.email}`, "_self")}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chat.messages.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chat.messages.map((msg, index) => {
                const isMyMessage = msg.sender._id === user?.id
                const showAvatar = index === 0 || chat.messages[index - 1].sender._id !== msg.sender._id

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMyMessage ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-1"}`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-[70%] ${
                        isMyMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {showAvatar && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback
                            className={`text-xs ${isMyMessage ? "bg-red-500 text-white" : "bg-gray-300 text-gray-700"}`}
                          >
                            {msg.sender.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`${!showAvatar ? (isMyMessage ? "mr-8" : "ml-8") : ""}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMyMessage
                              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          } shadow-sm`}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                        </div>
                        <div
                          className={`flex items-center mt-1 space-x-1 ${
                            isMyMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                          {getMessageStatusIcon(msg)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-gray-200 focus:border-red-300 focus:ring-red-200"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!message.trim() || sending}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
