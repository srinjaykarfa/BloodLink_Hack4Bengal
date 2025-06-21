import { DonorMap } from "@/components/donor-map"

export default function ChatbotMapPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Donor Locations</h1>
        <p className="text-gray-600">Interactive map showing blood donor locations across India</p>
      </div>

      <DonorMap className="w-full" />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Map Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Zoom out to see heatmap view</li>
            <li>• Zoom in to see individual donor markers</li>
            <li>• Hover over cities for donor counts</li>
            <li>• Click markers for donor details</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>Low donor density</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Medium donor density</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>High donor density</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
