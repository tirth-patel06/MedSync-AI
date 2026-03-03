import jwt from "jsonwebtoken";

/**
 * Socket.IO authentication middleware.
 * 
 * Usage in index.js:
 *   import { socketAuth } from "./middlewares/socketAuth.js";
 *   io.use(socketAuth);
 */
export const socketAuth = (socket, next) => {
  try {
    // Token sent from client via:
    // io(URL, { auth: { token }, query: { token } })
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user payload so event handlers can access socket.user
    socket.user = decoded;
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("Token expired. Please log in again."));
    }
    return next(new Error("Invalid token"));
  }
};