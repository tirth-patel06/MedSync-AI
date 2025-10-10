import express from "express";
import { getAuthUrl, getTokens, oauth2Client } from "../api/googleAuth.js";
import { google } from "googleapis";
import User from "../models/User.js"; // assuming you have a user model

const router = express.Router();



// Step 1: Send the user to Google OAuth login
router.get("/login", (req, res) => {
  const userId = req.query.userId;
  const url = getAuthUrl(userId);
  res.redirect(url); // user goes to Google consent screen
});



// Step 2: Google redirects back with a code
router.get("/callback", async (req, res) => {
    const { code, state: userId } = req.query;

    console.log("Backend - code:", code);
    console.log("Backend - userId:", userId);

  
    if (!code || !userId) return res.status(400).json({ error: "Missing code or userId" });
  
    try {
        console.log("Exchanging code:", code);
        console.log("Redirect URI used:", oauth2Client.redirectUri);

      const tokens = await getTokens(code);
  
      await User.findByIdAndUpdate(userId, {
        googleTokens: tokens,
      });

      console.log("Tokens saved successfully for user:", userId);
  
      res.redirect(`http://localhost:5173/dashboard?linked=true`);

    } catch (err) {
      console.error(err);
      res.status(500).send("Error linking Google Calendar");
    }
  });

  router.get("/calendar/status/:userId", async (req, res) => {
    try {
        console.log("Checking calendar for userId:", req.params.userId);
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(400).json({ linked: false, message: "User not found" });
      if (!user.googleTokens) return res.status(400).json({ linked: false, message: "No Google tokens found" });

      console.log("User tokens:", user.googleTokens);
  
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials(user.googleTokens);
  
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const calendars = await calendar.calendarList.list();
  
      res.json({
        linked: true,
        account: calendars.data.items?.[0]?.summary || "Calendar linked",
      });
    } catch (err) {
      console.error("Calendar check error:", err);
      res.status(500).json({ linked: false, message: "Error verifying calendar" });
    }
  });

export default router;