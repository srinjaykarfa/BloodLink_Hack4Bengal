import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Bell, Database, Users, MapPin } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All donor information is encrypted and securely stored with medical-grade privacy protection.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Emergency blood requests can be made anytime. Our system works around the clock.",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description: "Get notified immediately when your blood type is needed in your area.",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
    {
      icon: Database,
      title: "Blood Inventory",
      description: "Real-time tracking of blood availability across all partnered hospitals and centers.",
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50",
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Connect with a network of verified donors and recipients in your community.",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Find the nearest donation centers and match with local blood requests.",
      gradient: "from-red-500 to-pink-500",
      bgGradient: "from-red-50 to-pink-50",
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose E-Blood Link?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our platform makes blood donation and requests simple, secure, and efficient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm overflow-hidden relative`}
            >
              {/* Card Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              <CardHeader className="text-center relative">
                <div
                  className={`bg-gradient-to-r ${feature.gradient} rounded-2xl p-4 w-16 h-16 mx-auto mb-6 group-hover:animate-pulse shadow-lg`}
                >
                  <feature.icon className="h-8 w-8 text-white mx-auto" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-red-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
