import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import { logger } from "../utils/logger.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    logger.info("Register endpoint hit", { body: req.body });
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password || !role) {
      return next(new ErrorHandler("Please fill full form !"));
    }
    const isEmail = await User.findOne({ email });
    if (isEmail) {
      return next(new ErrorHandler("Email already registered !"));
    }
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });
    logger.info("User registered successfully", { userId: user._id });

    sendToken(user, 201, res, "User Registered Sucessfully !");
  } catch (error) {
    logger.error("Error in register controller", { error });
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  logger.info("Login attempt", { email, role });
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role !"));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password !", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found !`, 404)
    );
  }
  logger.info("User logged in successfully", { userId: user._id });

  sendToken(user, 201, res, "User Logged In Sucessfully !");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user ? req.user._id : "Unknown";
  logger.info("Logout request", { userId });

  const isProduction = process.env.NODE_ENV === "production";
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: isProduction, // true in production (https), false locally
      sameSite: isProduction ? "None" : "Lax", // None for prod, Lax for localhost
    })
    .json({
      success: true,
      message: "Logged Out Successfully !",
    });
  logger.info("User logged out successfully", { userId });
});

export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  if (!user) {
    logger.error("getUser failed: No user in request");
    return next(new ErrorHandler("User not found", 404));
  }

  logger.info("getUser success", { userId: user._id });

  res.status(200).json({
    success: true,
    user,
  });
});
