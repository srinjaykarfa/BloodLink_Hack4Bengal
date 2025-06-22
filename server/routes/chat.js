const express = require("express")
const router = express.Router()
const Chat = require("../models/Chat")
const BloodRequest = require("../models/BloodRequest")
const User = require("../models/User")
const auth = require("../middleware/auth")

// Create or get existing chat
router.post("/", auth, async (req, res) => {
  try {
    const { requestId, donorId } = req.body
    const userId = req.user.id

    console.log("🔄 Creating/Getting chat:", { requestId, donorId, userId })

    // Verify the blood request exists and is fulfilled
    const bloodRequest = await BloodRequest.findById(requestId)
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      })
    }

    // Check if request is fulfilled and user is involved
    if (bloodRequest.status !== "fulfilled") {
      return res.status(400).json({
        success: false,
        message: "Chat is only available for fulfilled requests",
      })
    }

    // Verify user is either the donor or recipient
    const isDonor = donorId === userId
    const isRecipient = bloodRequest.requestedBy.toString() === userId

    if (!isDonor && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this chat",
      })
    }

    // Find or create chat
    let chat = await Chat.findOne({
      request: requestId,
      donor: donorId,
      recipient: bloodRequest.requestedBy,
    }).populate([
      { path: "donor", select: "firstName lastName email phone bloodType" },
      { path: "recipient", select: "firstName lastName email phone" },
      { path: "request", select: "patientName bloodType unitsNeeded urgency" },
      { path: "messages.sender", select: "firstName lastName" },
    ])

    if (!chat) {
      chat = new Chat({
        request: requestId,
        donor: donorId,
        recipient: bloodRequest.requestedBy,
        messages: [],
        chatType: "request",
      })
      await chat.save()

      // Populate after save
      chat = await Chat.findById(chat._id).populate([
        { path: "donor", select: "firstName lastName email phone bloodType" },
        { path: "recipient", select: "firstName lastName email phone" },
        { path: "request", select: "patientName bloodType unitsNeeded urgency" },
        { path: "messages.sender", select: "firstName lastName" },
      ])
    }

    res.json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("❌ Error creating/getting chat:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create/get chat",
      error: error.message,
    })
  }
})

// Create or get general chat (not tied to blood requests)
router.post("/general", auth, async (req, res) => {
  try {
    const { donorId, recipientId } = req.body
    const userId = req.user.id

    console.log("🔄 Creating/Getting general chat:", { donorId, recipientId, userId })

    // Determine who is donor and who is recipient
    let actualDonorId, actualRecipientId

    if (donorId === userId) {
      // Current user is the donor
      actualDonorId = userId
      actualRecipientId = recipientId || donorId
    } else {
      // Current user wants to chat with the donor
      actualDonorId = donorId
      actualRecipientId = userId
    }

    // Verify both users exist
    const donor = await User.findById(actualDonorId)
    const recipient = await User.findById(actualRecipientId)

    if (!donor || !recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Find or create general chat
    let chat = await Chat.findOne({
      donor: actualDonorId,
      recipient: actualRecipientId,
      chatType: "general",
    }).populate([
      { path: "donor", select: "firstName lastName email phone bloodType" },
      { path: "recipient", select: "firstName lastName email phone" },
      { path: "messages.sender", select: "firstName lastName" },
    ])

    if (!chat) {
      chat = new Chat({
        donor: actualDonorId,
        recipient: actualRecipientId,
        messages: [],
        chatType: "general",
      })
      await chat.save()

      // Populate after save
      chat = await Chat.findById(chat._id).populate([
        { path: "donor", select: "firstName lastName email phone bloodType" },
        { path: "recipient", select: "firstName lastName email phone" },
        { path: "messages.sender", select: "firstName lastName" },
      ])
    }

    res.json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("❌ Error creating/getting general chat:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create/get general chat",
      error: error.message,
    })
  }
})

// Get general chat
router.get("/general/:donorId/:recipientId", auth, async (req, res) => {
  try {
    const { donorId, recipientId } = req.params
    const userId = req.user.id

    console.log("🔍 Getting general chat:", { donorId, recipientId, userId })

    // Verify user is part of this chat
    if (userId !== donorId && userId !== recipientId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this chat",
      })
    }

    const chat = await Chat.findOne({
      donor: donorId,
      recipient: recipientId,
      chatType: "general",
    }).populate([
      { path: "donor", select: "firstName lastName email phone bloodType" },
      { path: "recipient", select: "firstName lastName email phone" },
      { path: "messages.sender", select: "firstName lastName" },
    ])

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    res.json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("❌ Error getting general chat:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get general chat",
      error: error.message,
    })
  }
})

// Send message with Socket.IO
router.post("/:chatId/message", auth, async (req, res) => {
  try {
    const { chatId } = req.params
    const { message } = req.body
    const userId = req.user.id

    console.log("💬 Sending message:", { chatId, userId, message: message.substring(0, 50) })

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    // Verify user is part of this chat
    if (chat.donor.toString() !== userId && chat.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send messages in this chat",
      })
    }

    // Add message
    const newMessage = {
      sender: userId,
      message: message.trim(),
      timestamp: new Date(),
      status: "sent",
    }

    chat.messages.push(newMessage)
    chat.lastActivity = new Date()
    await chat.save()

    // Populate the new message sender info
    await chat.populate("messages.sender", "firstName lastName")

    // Get the newly added message
    const addedMessage = chat.messages[chat.messages.length - 1]

    // Emit to all users in this chat room via Socket.IO
    const io = req.app.get("io")
    if (io) {
      io.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        message: addedMessage,
        senderId: userId,
      })

      console.log(`📡 Message broadcasted to chat_${chatId}`)
    }

    res.json({
      success: true,
      message: addedMessage,
    })
  } catch (error) {
    console.error("❌ Error sending message:", error)
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    })
  }
})

// Get chat by request and donor
router.get("/request/:requestId/donor/:donorId", auth, async (req, res) => {
  try {
    const { requestId, donorId } = req.params
    const userId = req.user.id

    console.log("🔍 Getting chat:", { requestId, donorId, userId })

    const chat = await Chat.findOne({
      request: requestId,
      donor: donorId,
    }).populate([
      { path: "donor", select: "firstName lastName email phone bloodType" },
      { path: "recipient", select: "firstName lastName email phone" },
      { path: "request", select: "patientName bloodType unitsNeeded urgency" },
      { path: "messages.sender", select: "firstName lastName" },
    ])

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    // Verify user is part of this chat
    if (chat.donor._id.toString() !== userId && chat.recipient._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this chat",
      })
    }

    res.json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("❌ Error getting chat:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get chat",
      error: error.message,
    })
  }
})

// Mark messages as seen with Socket.IO
router.patch("/:chatId/seen", auth, async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    console.log("👁️ Marking messages as seen:", { chatId, userId })

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    // Verify user is part of this chat
    if (chat.donor.toString() !== userId && chat.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this chat",
      })
    }

    // Mark all messages from other user as seen
    let updatedCount = 0
    const seenMessageIds = []

    chat.messages.forEach((message) => {
      if (message.sender.toString() !== userId && message.status !== "seen") {
        message.status = "seen"
        seenMessageIds.push(message._id.toString())
        updatedCount++
      }
    })

    if (updatedCount > 0) {
      await chat.save()

      // Emit seen status via Socket.IO
      const io = req.app.get("io")
      if (io) {
        io.to(`chat_${chatId}`).emit("messages_seen", {
          chatId,
          messageIds: seenMessageIds,
          seenBy: userId,
        })
      }
    }

    res.json({
      success: true,
      message: `Marked ${updatedCount} messages as seen`,
    })
  } catch (error) {
    console.error("❌ Error marking messages as seen:", error)
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as seen",
      error: error.message,
    })
  }
})

// Get user's chats
router.get("/my-chats", auth, async (req, res) => {
  try {
    const userId = req.user.id

    console.log("📋 Getting user chats:", userId)

    const chats = await Chat.find({
      $or: [{ donor: userId }, { recipient: userId }],
      isActive: true,
    })
      .populate([
        { path: "donor", select: "firstName lastName email phone bloodType" },
        { path: "recipient", select: "firstName lastName email phone" },
        { path: "request", select: "patientName bloodType unitsNeeded urgency" },
        { path: "messages.sender", select: "firstName lastName" },
      ])
      .sort({ lastActivity: -1 })

    res.json({
      success: true,
      chats,
    })
  } catch (error) {
    console.error("❌ Error getting user chats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get chats",
      error: error.message,
    })
  }
})

module.exports = router
