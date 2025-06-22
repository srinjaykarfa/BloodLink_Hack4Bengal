"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Send, X, Phone, Mail, Droplets, User, Check, CheckCheck, Clock, Wifi, WifiOff } from "lucide-react"
import { io, type Socket } from "socket.io-client"

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

interface SocketChatInterfaceProps {
  requestId?: string
  donorId: string
  recipientId?: string
  onClose: () => void
  chatType?: "request" | "general"
}

export function SocketChatInterface({
  requestId,
  donorId,
  recipientId,
  onClose,
  chatType = "request",
}: SocketChatInterfaceProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return

    const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

    console.log("🔌 Connecting to Socket.IO server:", serverUrl)

    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server")
      setIsConnected(true)
      socket.emit("join", user.id)
    })

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server")
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error)
      setIsConnected(false)
    })

    // Listen for new messages
    socket.on("new_message", (data) => {
      console.log("📨 Received new message:", data)

      if (data.senderId !== user.id) {
        setChat((prevChat) => {
          if (!prevChat || prevChat._id !== data.chatId) return prevChat

          // Check if message already exists
          const messageExists = prevChat.messages.some((msg) => msg._id === data.message._id)
          if (messageExists) return prevChat

          const updatedChat = {
            ...prevChat,
            messages: [...prevChat.messages, data.message],
            lastActivity: new Date().toISOString(),
          }

          // Show toast notification
          const otherUser = user.id === prevChat.donor._id ? prevChat.recipient : prevChat.donor
          toast({
            title: "New message! 💬",
            description: `${otherUser.firstName}: ${data.message.message.substring(0, 50)}${data.message.message.length > 50 ? "..." : ""}`,
          })

          return updatedChat
        })
      }
    })

    // Listen for typing indicators
    socket.on("user_typing", (data) => {
      if (data.userId !== user.id) {
        setOtherUserTyping(data.isTyping)
        if (data.isTyping) {
          setTimeout(() => setOtherUserTyping(false), 3000)
        }
      }
    })

    // Listen for message seen status
    socket.on("messages_seen", (data) => {
      if (data.seenBy !== user.id) {
        setChat((prevChat) => {
          if (!prevChat || prevChat._id !== data.chatId) return prevChat

          const updatedMessages = prevChat.messages.map((msg) => {
            if (data.messageIds.includes(msg._id.toString()) && msg.sender._id === user.id) {
              return { ...msg, status: "seen" as const }
            }
            return msg
          })

          return { ...prevChat, messages: updatedMessages }
        })
      }
    })

    return () => {
      console.log("🔌 Cleaning up Socket.IO connection")
      socket.disconnect()
    }
  }, [user, toast])

  // Join chat room when chat is loaded
  useEffect(() => {
    if (chat && socketRef.current && isConnected) {
      console.log(`🏠 Joining chat room: chat_${chat._id}`)
      socketRef.current.emit("join_chat", chat._id)

      return () => {
        if (socketRef.current) {
          console.log(`👋 Leaving chat room: chat_${chat._id}`)
          socketRef.current.emit("leave_chat", chat._id)
        }
      }
    }
  }, [chat, isConnected])

  const markMessagesAsSeen = useCallback(async () => {
    if (!chat || !user) return

    try {
      await apiClient.markMessagesAsRead(chat._id)
    } catch (error) {
      console.error("❌ Error marking messages as seen:", error)
    }
  }, [chat, user])

  const initializeChat = useCallback(async () => {
    try {
      setLoading(true)
      console.log("🔄 Initializing chat:", { requestId, donorId, recipientId, chatType })

      if (chatType === "general") {
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
  }, [requestId, donorId, recipientId, chatType, user?.id, toast])

  // Initialize chat
  useEffect(() => {
    initializeChat()
  }, [initializeChat])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages, scrollToBottom])

  // Mark messages as seen when chat loads or updates
  useEffect(() => {
    if (chat) {
      markMessagesAsSeen()
    }
  }, [chat, markMessagesAsSeen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending || !chat) return

    try {
      setSending(true)
      const response = await apiClient.sendMessage(chat._id, message.trim())

      // Add message to local state immediately for better UX
      setChat((prevChat) => {
        if (!prevChat) return null
        return {
          ...prevChat,
          messages: [...prevChat.messages, response.message],
          lastActivity: new Date().toISOString(),
        }
      })

      setMessage("")
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

  const handleTyping = (value: string) => {
    setMessage(value)

    if (!chat || !socketRef.current || !isConnected) return

    // Emit typing indicator
    if (!isTyping && value.trim()) {
      setIsTyping(true)
      socketRef.current.emit("typing", { chatId: chat._id, isTyping: true })
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && isConnected) {
        setIsTyping(false)
        socketRef.current.emit("typing", { chatId: chat._id, isTyping: false })
      }
    }, 1000)
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
              <CardTitle className="text-lg flex items-center gap-2">
                {otherUser.firstName} {otherUser.lastName}
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-200" title="Connected" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-200" title="Disconnected" />
                )}
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
        <ScrollArea className="h-full p-4">
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

            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 max-w-[70%]">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-gray-300 text-gray-700">
                      {otherUser.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
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
                </div>
              </div>
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
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="flex-1 border-gray-200 focus:border-red-300 focus:ring-red-200"
            disabled={sending || !isConnected}
          />
          <Button
            type="submit"
            disabled={!message.trim() || sending || !isConnected}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            Connection lost. Trying to reconnect...
          </p>
        )}
      </div>
    </Card>
  )
}
      