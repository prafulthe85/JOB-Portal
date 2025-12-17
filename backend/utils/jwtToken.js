const { logger } = require("./logger");

export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Set httpOnly to true
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  };
  console.log("🔐 Sending Auth Token Cookie:");
  console.log("👉 isProduction:", isProduction);
  logger.info("👉 cookie expires at:", options.expires.toISOString());
  console.log("👉 token length:", token.length); // Don't log full token in production

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};
