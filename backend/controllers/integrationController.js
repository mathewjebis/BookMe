import User from "../models/User.js";

import { getGoogleAuthUrl, getGoogleTokens } from "../utils/googleCalendar.js";

export const getGoogleConnectUrl = async (req, res) => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_CLIENT_REDIRECT_URI
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

    await User.findByIdAndUpdate(state, {
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
