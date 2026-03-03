import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header exists
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // 2. Check correct format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid authorization format. Expected: Bearer <token>" });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    // 4. Guard against null/undefined stored as strings
    if (!token || token.trim() === "" || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Token is missing or invalid" });
    }

    // 5. Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();

  } catch (err) {
    console.log(err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Token is not valid" });
  }
}