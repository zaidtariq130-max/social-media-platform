const User = require("../models/User");

// GET /api/users — returns all users except the logged-in user
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "-password -refreshTokenHash"
    );
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getUsers };
