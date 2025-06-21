"use client"

import { useEffect, useState } from "react"

export function Stats() {
  const [counts, setCounts] = useState({
    donors: 0,
    lives: 0,
    hospitals: 0,
    support: 0,
  })

  const stats = [
    { key: "donors", number: "10,000+", label: "Registered Donors", target: 10000 },
    { key: "lives", number: "5,000+", label: "Lives Saved", target: 5000 },
    { key: "hospitals", number: "500+", label: "Partner Hospitals", target: 500 },
    { key: "support", number: "24/7", label: "Emergency Support", target: 24 },
  ]

  useEffect(() => {
    const animateCounters = () => {
      stats.forEach((stat) => {
        if (stat.key === "support") return // Skip 24/7

        let current = 0
        const increment = stat.target / 100
        const timer = setInterval(() => {
          current += increment
          if (current >= stat.target) {
            current = stat.target
            clearInterval(timer)
          }
          setCounts((prev) => ({
            ...prev,
            [stat.key]: Math.floor(current),
          }))
        }, 20)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters()
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    const element = document.getElementById("stats-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="stats-section"
      className="py-20 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/20 to-transparent"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center text-white group transform hover:scale-110 transition-all duration-300"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                  {stat.key === "support"
                    ? stat.number
                    : stat.key === "donors"
                      ? `${Math.floor(counts.donors / 1000)}k+`
                      : stat.key === "lives"
                        ? `${Math.floor(counts.lives / 1000)}k+`
                        : stat.key === "hospitals"
                          ? `${counts.hospitals}+`
                          : stat.number}
                </div>
                <div className="text-red-100 font-medium group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
