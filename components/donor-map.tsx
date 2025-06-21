"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

declare global {
  interface Window {
    L: any
  }
}

interface DonorMapProps {
  className?: string
}

export function DonorMap({ className }: DonorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Load CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // Load JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = initializeMap
        document.head.appendChild(script)

        // Load heat plugin
        const heatScript = document.createElement("script")
        heatScript.src = "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js"
        document.head.appendChild(heatScript)

        // Load marker cluster plugin
        const clusterLink = document.createElement("link")
        clusterLink.rel = "stylesheet"
        clusterLink.href = "https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css"
        document.head.appendChild(clusterLink)

        const clusterDefaultLink = document.createElement("link")
        clusterDefaultLink.rel = "stylesheet"
        clusterDefaultLink.href = "https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css"
        document.head.appendChild(clusterDefaultLink)

        const clusterScript = document.createElement("script")
        clusterScript.src = "https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js"
        document.head.appendChild(clusterScript)
      } else if (window.L) {
        initializeMap()
      }
    }

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = window.L

      // India bounds
      const indiaBounds = [
        [6.5546079, 68.1113787],
        [35.6745457, 97.395561],
      ]

      // Initialize map
      const map = L.map(mapRef.current, {
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 5,
        maxZoom: 12,
      }).setView([22.57, 88.36], 5)

      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      // Fetch and display donor locations
      try {
        const response = await fetch("/api/chatbot/donor-locations")
        const data = await response.json()

        let heatLayer: any
        let markerClusterGroup: any
        let cityHoverCircles: any[] = []

        const addHeatmap = (data: any[]) => {
          const maxCount = Math.max(...data.map((d) => d.count))
          const scaleFactor = maxCount > 0 ? 50 / maxCount : 0

          const heatData = data.map((d) => [d.lat, d.lon, d.count * scaleFactor])

          heatLayer = L.heatLayer(heatData, {
            radius: 30,
            blur: 20,
            minOpacity: 0.5,
            gradient: {
              0.1: "lime",
              0.4: "yellow",
              0.7: "orange",
              1.0: "red",
            },
          }).addTo(map)
        }

        const addMarkers = (data: any[]) => {
          markerClusterGroup = L.markerClusterGroup()

          data.forEach((cityData: any) => {
            for (let i = 0; i < cityData.count; i++) {
              const latOffset = (Math.random() - 0.5) * 0.05
              const lonOffset = (Math.random() - 0.5) * 0.05

              const lat = cityData.lat + latOffset
              const lon = cityData.lon + lonOffset

              const marker = L.marker([lat, lon]).bindPopup(`<div><b>Donor:</b> From ${cityData.city}</div>`)
              markerClusterGroup.addLayer(marker)
            }
          })
          map.addLayer(markerClusterGroup)
        }

        const updateMapLayers = (data: any[]) => {
          if (map.getZoom() > 8) {
            if (heatLayer) {
              map.removeLayer(heatLayer)
              heatLayer = null
            }
            if (!markerClusterGroup) {
              addMarkers(data)
            }
            cityHoverCircles.forEach((circle) => circle.remove())
            cityHoverCircles = []
          } else {
            if (markerClusterGroup) {
              map.removeLayer(markerClusterGroup)
              markerClusterGroup = null
            }
            if (!heatLayer) {
              addHeatmap(data)
            }
            if (cityHoverCircles.length === 0) {
              data.forEach((cityData) => {
                const circle = L.circleMarker([cityData.lat, cityData.lon], {
                  radius: 10,
                  fillColor: "transparent",
                  color: "transparent",
                  weight: 0,
                  opacity: 0,
                  fillOpacity: 0,
                })
                  .bindPopup(`<div><b>${cityData.city}</b><br>Donors: ${cityData.count}</div>`, { closeButton: false })
                  .addTo(map)
                cityHoverCircles.push(circle)

                circle.on("mouseover", function (e: any) {
                  this.openPopup(e.latlng)
                })
                circle.on("mouseout", function () {
                  this.closePopup()
                })
              })
            }
          }
        }

        // Initialize with heatmap
        addHeatmap(data)

        // Add city hover circles
        data.forEach((cityData) => {
          const circle = L.circleMarker([cityData.lat, cityData.lon], {
            radius: 10,
            fillColor: "transparent",
            color: "transparent",
            weight: 0,
            opacity: 0,
            fillOpacity: 0,
          })
            .bindPopup(`<div><b>${cityData.city}</b><br>Donors: ${cityData.count}</div>`, { closeButton: false })
            .addTo(map)
          cityHoverCircles.push(circle)

          circle.on("mouseover", function (e: any) {
            this.openPopup(e.latlng)
          })
          circle.on("mouseout", function () {
            this.closePopup()
          })
        })

        // Add zoom event listener
        map.on("zoomend", () => {
          updateMapLayers(data)
        })

        updateMapLayers(data)
      } catch (error) {
        console.error("Error loading donor locations:", error)
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Donor Locations Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapRef} className="h-[400px] w-full rounded-b-lg" />
      </CardContent>
    </Card>
  )
}
