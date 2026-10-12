const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const issueTokensAndRespond = async (res, user, statusCode, message) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(statusCode).json({
    message,
    token: accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  });
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return issueTokensAndRespond(
      res,
      user,
      201,
      "User registered successfully"
    );

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    // Account does not exist
    if (!user) {
      return res.status(404).json({
        message: "Account not found",
        detail: "You don't have an account yet. Please sign up first."
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    // Account exists but password is wrong
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Login failed",
        detail: "Invalid email or password."
      });
    }

    return issueTokensAndRespond(res, user, 200, "Login successful");

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};


const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};


const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "No refresh token provided"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired refresh token"
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        message: "Refresh token not recognized"
      });
    }

    const isValid = await bcrypt.compare(token, user.refreshTokenHash);

    if (!isValid) {
      // Possible token reuse/theft: invalidate stored token
      user.refreshTokenHash = null;
      await user.save();

      res.clearCookie("refreshToken", refreshCookieOptions);
      return res.status(401).json({
        message: "Refresh token not recognized"
      });
    }

    // Rotate: issue a brand new access + refresh token pair
    return issueTokensAndRespond(res, user, 200, "Token refreshed");

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};


const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
      } catch (err) {
        // token already invalid/expired, nothing to clean up
      }
    }

    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = {
  signup,
  login,
  profile,
  refresh,
  logout
};