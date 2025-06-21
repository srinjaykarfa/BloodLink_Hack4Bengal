import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function EmergencyAlert() {
  return (
    <div className="bg-red-600 text-white py-2">
      <div className="container mx-auto px-4">
        <Alert className="border-0 bg-transparent text-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>🚨 URGENT: O- blood needed at City Hospital. 2 units required immediately.</span>
            <Button variant="outline" size="sm" className="bg-white text-red-600 hover:bg-red-50 ml-4">
              Respond Now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
