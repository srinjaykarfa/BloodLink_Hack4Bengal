import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Stats } from "@/components/stats"
import { EmergencyAlert } from "@/components/emergency-alert"
import { ChatIcon } from "@/components/chat-icon"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <EmergencyAlert />
      <Hero />
      <Stats />
      <Features />
      <ChatIcon />
    </div>
  )
}
