"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, X, MessageCircle } from "lucide-react"

interface Message {
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatbotInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>")
    .replace(/• /g, "&bull; ")
}

export function ChatbotInterface({ isOpen, onClose }: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm ChainVein Chat, your blood donation assistant. I can help you:\n\n• Find blood donors (e.g., 'I need A+ in Kolkata')\n• Check blood compatibility (e.g., 'What can O+ donate to?')\n• Answer donation questions\n\nHow can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const isValidQuery = (query: string) => {
    const validBloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
    const bloodTypePattern = /[ABOab]{1,2}[+-]/i
    const queryLower = query.toLowerCase()

    const bloodTypeMatch = queryLower.match(bloodTypePattern)
    const hasValidBloodType = bloodTypeMatch && validBloodTypes.includes(bloodTypeMatch[0].toUpperCase())

    const donateKeywords = [
      "donate blood to",
      "can i donate",
      "give blood to",
      "donate to which groups",
      "groups can i donate to",
    ]
    const receiveKeywords = [
      "receive blood from",
      "can i receive",
      "get blood from",
      "receive from which groups",
      "groups can donate to me",
    ]

    const isDonateQuery = donateKeywords.some((keyword) => queryLower.includes(keyword))
    const isReceiveQuery = receiveKeywords.some((keyword) => queryLower.includes(keyword))

    if (isDonateQuery || isReceiveQuery) {
      return hasValidBloodType
    }

    const donorSearchPattern = /[ABOab]{1,2}[+-].*\bin\b\s+[A-Za-z\s]+/i
    if (donorSearchPattern.test(query.trim())) {
      return hasValidBloodType
    }

    return false
  }

  const handleSendMessage = async () => {
    const query = inputValue.trim()
    setError("")

    if (!isValidQuery(query)) {
      setError(
        "❌ Please enter a valid query. Examples: 'I need B+ in Delhi', 'What can O+ receive?', or 'What can I donate if I am A-?'.",
      )
      return
    }

    const userMessage: Message = {
      text: query,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/chatbot?query=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (response.ok) {
        const botMessage: Message = {
          text: data.reply,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error(data.error || "Server error")
      }
    } catch (error) {
      console.error("Fetch error:", error)
      const errorMessage: Message = {
        text: "⚠️ Server error. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col bg-gradient-to-br from-red-50 to-pink-50 shadow-2xl border-0">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6" />
              <CardTitle className="text-lg">ChainVein Chat</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                        : "bg-white text-gray-800 border"
                    }`}
                  >
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(message.text),
                      }}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border p-3 rounded-2xl shadow-sm">
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
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., I need A+ in Kolkata or What can O+ receive?"
              className="flex-1 border-gray-200 focus:border-red-300 focus:ring-red-200"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-6"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
