const express = require("express")
const Inventory = require("../models/Inventory")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all hospital inventories
router.get("/", async (req, res) => {
  try {
    const inventories = await Inventory.find()
      .populate("managedBy", "firstName lastName email")
      .sort({ "hospital.name": 1 })

    // Calculate status for each inventory
    const inventoriesWithStatus = inventories.map((inventory) => {
      const inventoryObj = inventory.toObject()
      const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

      // Add status for each blood type
      bloodTypes.forEach((type) => {
        inventoryObj.bloodStock[type].status = inventory.getBloodTypeStatus(type)
        inventoryObj.bloodStock[type].percentage =
          (inventoryObj.bloodStock[type].units / inventoryObj.bloodStock[type].capacity) * 100
      })

      inventoryObj.overallStatus = inventory.getOverallStatus()
      return inventoryObj
    })

    res.json({
      success: true,
      inventories: inventoriesWithStatus,
    })
  } catch (error) {
    console.error("Get inventories error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventories",
    })
  }
})

// Get inventory by hospital ID
router.get("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate("managedBy", "firstName lastName email")

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      })
    }

    const inventoryObj = inventory.toObject()
    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

    // Add status for each blood type
    bloodTypes.forEach((type) => {
      inventoryObj.bloodStock[type].status = inventory.getBloodTypeStatus(type)
      inventoryObj.bloodStock[type].percentage =
        (inventoryObj.bloodStock[type].units / inventoryObj.bloodStock[type].capacity) * 100
    })

    inventoryObj.overallStatus = inventory.getOverallStatus()

    res.json({
      success: true,
      inventory: inventoryObj,
    })
  } catch (error) {
    console.error("Get inventory error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    })
  }
})

// Create new hospital inventory
router.post("/", auth, async (req, res) => {
  try {
    const { hospital, bloodStock } = req.body

    const inventory = new Inventory({
      hospital,
      bloodStock: bloodStock || {},
      managedBy: req.user.userId,
    })

    await inventory.save()
    await inventory.populate("managedBy", "firstName lastName email")

    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      inventory,
    })
  } catch (error) {
    console.error("Create inventory error:", error)
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create inventory",
    })
  }
})

// Update blood stock
router.patch("/:id/stock", auth, async (req, res) => {
  try {
    const { bloodType, units, operation = "set" } = req.body

    const inventory = await Inventory.findById(req.params.id)
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      })
    }

    if (!inventory.bloodStock[bloodType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood type",
      })
    }

    // Update stock based on operation
    if (operation === "add") {
      inventory.bloodStock[bloodType].units += units
    } else if (operation === "subtract") {
      inventory.bloodStock[bloodType].units = Math.max(0, inventory.bloodStock[bloodType].units - units)
    } else {
      inventory.bloodStock[bloodType].units = units
    }

    inventory.bloodStock[bloodType].lastUpdated = new Date()
    await inventory.save()

    const inventoryObj = inventory.toObject()
    inventoryObj.bloodStock[bloodType].status = inventory.getBloodTypeStatus(bloodType)
    inventoryObj.bloodStock[bloodType].percentage =
      (inventoryObj.bloodStock[bloodType].units / inventoryObj.bloodStock[bloodType].capacity) * 100

    res.json({
      success: true,
      message: "Stock updated successfully",
      inventory: inventoryObj,
    })
  } catch (error) {
    console.error("Update stock error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
    })
  }
})

// Get aggregated statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const inventories = await Inventory.find()

    const stats = {
      totalHospitals: inventories.length,
      totalUnits: 0,
      criticalTypes: 0,
      lowStock: 0,
      wellStocked: 0,
      bloodTypeStats: {},
    }

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

    // Initialize blood type stats
    bloodTypes.forEach((type) => {
      stats.bloodTypeStats[type] = {
        totalUnits: 0,
        totalCapacity: 0,
        criticalCount: 0,
        lowCount: 0,
      }
    })

    inventories.forEach((inventory) => {
      bloodTypes.forEach((type) => {
        const stock = inventory.bloodStock[type]
        const status = inventory.getBloodTypeStatus(type)

        stats.totalUnits += stock.units
        stats.bloodTypeStats[type].totalUnits += stock.units
        stats.bloodTypeStats[type].totalCapacity += stock.capacity

        if (status === "critical") {
          stats.criticalTypes++
          stats.bloodTypeStats[type].criticalCount++
        } else if (status === "low") {
          stats.lowStock++
          stats.bloodTypeStats[type].lowCount++
        } else if (status === "good") {
          stats.wellStocked++
        }
      })
    })

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    })
  }
})

module.exports = router
