"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Users, Award, Clock, Phone, Mail, MapPin, Target, Eye, Shield, Droplets } from "lucide-react"

export default function AboutPage() {
  const stats = [
    { icon: Heart, label: "Lives Saved", value: "50,000+", color: "text-red-500", bgColor: "bg-red-50" },
    { icon: Users, label: "Registered Donors", value: "25,000+", color: "text-blue-500", bgColor: "bg-blue-50" },
    { icon: Award, label: "Years of Service", value: "15+", color: "text-green-500", bgColor: "bg-green-50" },
    { icon: Clock, label: "24/7 Emergency", value: "Available", color: "text-orange-500", bgColor: "bg-orange-50" },
  ]

  const services = [
    {
      title: "Blood Collection",
      description: "Safe and hygienic blood collection from voluntary donors with modern equipment",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Blood Testing",
      description: "Comprehensive testing for blood-borne diseases and compatibility matching",
      icon: Shield,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Blood Storage",
      description: "State-of-the-art storage facilities maintaining optimal temperature conditions",
      icon: Droplets,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Emergency Supply",
      description: "24/7 emergency blood supply for critical medical situations and surgeries",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ]

  const team = [
    {
      name: "Dr. Sarah Ahmed",
      role: "Chief Medical Officer",
      experience: "15+ years",
      specialization: "Hematology",
      initials: "SA",
      color: "from-red-500 to-pink-500",
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Blood Bank Director",
      experience: "12+ years",
      specialization: "Transfusion Medicine",
      initials: "RK",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Ms. Fatima Khan",
      role: "Lab Supervisor",
      experience: "10+ years",
      specialization: "Clinical Laboratory",
      initials: "FK",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Mr. Arif Hassan",
      role: "Donor Relations Manager",
      experience: "8+ years",
      specialization: "Community Outreach",
      initials: "AH",
      color: "from-purple-500 to-violet-500",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Heart className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
              About E-Blood Link
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              Connecting lives through the gift of blood donation. We are committed to ensuring safe, accessible, and
              reliable blood supply for our community.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge
              variant="secondary"
              className="text-lg px-6 py-3 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all"
            >
              <Heart className="w-5 h-5 mr-2" />
              Saving Lives Since 2009
            </Badge>
            <Badge
              variant="secondary"
              className="text-lg px-6 py-3 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all"
            >
              <Users className="w-5 h-5 mr-2" />
              Trusted by Thousands
            </Badge>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-3">{stat.value}</h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To provide safe, adequate, and timely blood supply to save lives and improve health outcomes in our
                  community. We strive to maintain the highest standards of quality, safety, and accessibility in blood
                  banking services while promoting voluntary blood donation.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To be the leading blood bank organization that ensures no life is lost due to blood shortage. We
                  envision a future where every person in need has access to safe blood, supported by a network of
                  dedicated voluntary donors and cutting-edge technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive blood banking services designed to meet all your transfusion needs with excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-14 h-14 ${service.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      <service.icon className={`w-7 h-7 ${service.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Expert Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated professionals committed to maintaining the highest standards in blood banking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${member.color} rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <span className="text-2xl font-bold text-white">{member.initials}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-red-500 font-medium mb-4">{member.role}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="font-medium">{member.experience} Experience</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p>{member.specialization}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-500"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Have questions or need emergency blood supply? Contact us anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Emergency Hotline</h3>
                <p className="text-2xl font-bold mb-2">+880-1234-567890</p>
                <p className="text-sm opacity-90">24/7 Available</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Email Us</h3>
                <p className="text-xl font-bold mb-2">bytebusters.code@gmail.com</p>
                <p className="text-sm opacity-90">Response within 2 hours</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Visit Us</h3>
                <p className="text-xl font-bold mb-2">123 Medical Center</p>
                <p className="text-sm opacity-90">Kolkata, West Benagal</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Heart className="w-6 h-6 mr-3" />
              Become a Donor Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
