const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// API client with authentication
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`

    console.log(`🔗 API Request: ${options.method || "GET"} ${url}`)

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      console.log(`📡 Response Status: ${response.status} ${response.statusText}`)

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("❌ Non-JSON response:", text)
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`)
      }

      const data = await response.json()
      console.log("📦 Response Data:", data)

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error("❌ API request error:", error)

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Make sure the backend is running on http://localhost:5000")
      }

      throw error
    }
  }

  // Auth methods
  async register(userData: any) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    console.log("🔐 Attempting login for:", credentials.email)
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async getCurrentUser() {
    return this.request("/auth/me")
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  // Test connection method
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Donors methods
  async getDonors(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/donors${queryString}`)
  }

  async getDonor(id: string) {
    return this.request(`/donors/${id}`)
  }

  async updateDonorAvailability(id: string, isAvailable: boolean) {
    return this.request(`/donors/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    })
  }

  // Blood requests methods
  async createBloodRequest(requestData: any) {
    return this.request("/requests", {
      method: "POST",
      body: JSON.stringify(requestData),
    })
  }

  async getBloodRequests(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/requests${queryString}`)
  }

  async getBloodRequest(id: string) {
    return this.request(`/requests/${id}`)
  }

  async respondToRequest(id: string, notes?: string) {
    return this.request(`/requests/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ notes: notes || "I am available to donate blood" }),
    })
  }

  async updateRequestStatus(id: string, status: string, fulfilledBy?: string) {
    return this.request(`/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, fulfilledBy }),
    })
  }

  // Get matching requests for current donor
  async getMatchingRequests() {
    console.log("🔍 Fetching matching requests for donor")
    return this.request("/requests/donor/matching")
  }

  // Get user's own requests
  async getMyRequests() {
    console.log("📝 Fetching user's own requests")
    return this.request("/requests/user/my-requests")
  }

  // Get donor's response history
  async getMyResponses() {
    console.log("📝 Fetching donor's response history")
    return this.request("/requests/donor/my-responses")
  }

  // Inventory methods
  async getInventories() {
    return this.request("/inventory")
  }

  async getInventory(id: string) {
    return this.request(`/inventory/${id}`)
  }

  async updateStock(id: string, bloodType: string, units: number, operation = "set") {
    return this.request(`/inventory/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ bloodType, units, operation }),
    })
  }

  async getInventoryStats() {
    return this.request("/inventory/stats/summary")
  }

  // Chat methods
  async createChat(requestId: string, donorId: string) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({ requestId, donorId }),
    })
  }

  async sendMessage(chatId: string, message: string) {
    return this.request(`/chat/${chatId}/message`, {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  }

  async getChat(chatPath: string) {
    return this.request(`/chat/${chatPath}`)
  }

  async getUserChats() {
    return this.request("/chat/my-chats")
  }

  async markMessagesAsRead(chatId: string) {
    return this.request(`/chat/${chatId}/seen`, {
      method: "PATCH",
    })
  }

  // General Chat methods (not tied to blood requests)
  async createGeneralChat(donorId: string, recipientId?: string) {
    return this.request("/chat/general", {
      method: "POST",
      body: JSON.stringify({ donorId, recipientId }),
    })
  }

  async getGeneralChat(donorId: string, recipientId: string) {
    return this.request(`/chat/general/${donorId}/${recipientId}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
