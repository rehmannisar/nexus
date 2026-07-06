const User = require("../models/User");

// @route  GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/users/profile  (update own profile)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      name,
      bio,
      investmentHistory,
      investmentPreferences,
      startupHistory,
      profilePicture,
    } = req.body;

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    if (user.role === "investor") {
      if (investmentHistory) user.investmentHistory = investmentHistory;
      if (investmentPreferences) user.investmentPreferences = investmentPreferences;
    }

    if (user.role === "entrepreneur") {
      if (startupHistory) user.startupHistory = startupHistory;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      investmentHistory: updatedUser.investmentHistory,
      investmentPreferences: updatedUser.investmentPreferences,
      startupHistory: updatedUser.startupHistory,
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/users?role=investor   (browse dashboards - list investors/entrepreneurs)
const listUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, listUsers };
