import { Button } from "@/components/ui/button"
import { Heart, Users, MapPin, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-rose-200/30 to-red-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-200/20 to-rose-200/20 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Heart Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Heart className="h-20 w-20 text-red-500 fill-current animate-pulse drop-shadow-lg" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-spin" />
              </div>
            </div>
          </div>

          {/* Main Heading with Gradient Text */}
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent animate-pulse">
              Save Lives
            </span>
            <br />
            <span className="text-gray-900">Through Blood Donation</span>
          </h1>

          {/* Subtitle with Animation */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed animate-fade-in-up">
            Connect blood donors with those in need. Every donation can save up to{" "}
            <span className="font-bold text-red-600 animate-pulse">3 lives</span>. Join our community of heroes making a
            difference every day.
          </p>

          {/* CTA Buttons with Hover Animations */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/register">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Heart className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Become a Donor
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
            <Link href="/request">
              <Button
                size="lg"
                variant="outline"
                className="group border-2 border-red-600 text-red-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Users className="mr-3 h-6 w-6 group-hover:animate-bounce" />
                Request Blood
              </Button>
            </Link>
          </div>

          {/* Feature Cards with Animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Easy Registration",
                description: "Quick and simple donor registration process",
                gradient: "from-red-500 to-pink-500",
                delay: "delay-100",
              },
              {
                icon: MapPin,
                title: "Find Nearby Centers",
                description: "Locate blood donation centers near you",
                gradient: "from-pink-500 to-rose-500",
                delay: "delay-200",
              },
              {
                icon: Users,
                title: "Emergency Requests",
                description: "Urgent blood requests and notifications",
                gradient: "from-rose-500 to-red-500",
                delay: "delay-300",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 ${feature.delay} animate-fade-in-up border border-white/20`}
              >
                <div
                  className={`bg-gradient-to-r ${feature.gradient} rounded-full p-4 w-16 h-16 mx-auto mb-6 group-hover:animate-pulse`}
                >
                  <feature.icon className="h-8 w-8 text-white mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link href="/request">
          <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-full p-4 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce">
            <Heart className="h-6 w-6 text-white" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
