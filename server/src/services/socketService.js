import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

class SocketService {
  constructor() {
    this.socket = null;
    this.notifications = [];
    this.notificationListeners = [];
  }

  connect() {
    // ── JWT guard ──────────────────────────────────────────────────────────
    const token = localStorage.getItem("token");
    const tokenValid =
      token &&
      token !== "null" &&
      token !== "undefined" &&
      token.trim() !== "";

    if (!tokenValid) {
      console.warn("socketService: no valid token, skipping connection.");
      return;
    }

    // Avoid duplicate connections
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      // ✅ Pass JWT so server's io.use() middleware can verify it
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);

      // Join personal notification room
      const user = this._getUser();
      if (user?.id) {
        this.socket.emit("join-user", user.id);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Listen for incoming notifications from server
    this.socket.on("notification", (notification) => {
      this.notifications.unshift(notification);
      this.notificationListeners.forEach((cb) => cb(notification));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  onNotification(callback) {
    this.notificationListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.notificationListeners = this.notificationListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  getNotifications() {
    return this.notifications;
  }

  clearNotifications() {
    this.notifications = [];
  }

  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId
    );
  }

  // ── Private helpers ──────────────────────────────────────────────────────
  _getUser() {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "null" || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}

// Export a singleton so the same socket is reused across the app
const socketService = new SocketService();
export default socketService;