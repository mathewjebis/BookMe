import User from "../models/User.js";
import jwt from "jsonwebtoken";

import { getGoogleAuthUrl, getGoogleTokens } from "../utils/googleCalendar.js";

export const getGoogleConnectUrl = async (req, res) => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_CLIENT_URI
  ) {
    return res.status(503).json({
      message: "Google Calendar is not configured yet",
    });
  }

  res.json({
    url: getGoogleAuthUrl(req.user.id),
  });
};

export const handleGoogleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${clientUrl}/profile?calendar=failed`);
    }

    const token = await getGoogleTokens(code);

    if (!token.refresh_token) {
      return res.redirect(
        `${clientUrl}/profile?calendar=missing-refresh-token`,
      );
    }

    let statePayload;
    try {
      statePayload = jwt.verify(state, process.env.JWT_SECRET);
    } catch {
      return res.redirect(`${clientUrl}/profile?calendar=failed`);
    }

    if (!statePayload?.userId) {
      return res.redirect(`${clientUrl}/profile?calendar=failed`);
    }

    const user = await User.findById(statePayload.userId).select('_id');
    if (!user) {
      return res.redirect(`${clientUrl}/profile?calendar=failed`);
    }

    await User.findByIdAndUpdate(user._id, {
      googleRefreshToken: token.refresh_token,
      googleCalendarConnected: true,
      googleCalendarId: "primary",
    });

    return res.redirect(`${clientUrl}/profile?calendar=connected`);
  } catch (error) {
    console.error("Google Calendar callback error:", error);

    return res.redirect(`${clientUrl}/profile?calendar=failed`);
  }
};
