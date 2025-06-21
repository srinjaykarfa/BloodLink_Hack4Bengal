"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { ChatbotInterface } from "./chatbot-interface"

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      <ChatbotInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
