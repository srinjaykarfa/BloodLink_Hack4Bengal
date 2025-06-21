"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { BloodChatAssistant } from "./blood-chat-assistant"

export function ChatIcon() {
  const [showChat, setShowChat] = useState(false)

  return (
    <>
      {/* Floating Chat Icon - Fixed positioning to avoid overlap */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setShowChat(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-white border-2 border-white/20 backdrop-blur-sm"
          aria-label="Open Blood Donor Chat"
        >
          <MessageCircle className="h-7 w-7" />
        </button>

        {/* Subtle pulse animation */}
        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20 pointer-events-none"></div>
      </div>

      {/* Chat Assistant Modal */}
      {showChat && <BloodChatAssistant onClose={() => setShowChat(false)} />}
    </>
  )
}
