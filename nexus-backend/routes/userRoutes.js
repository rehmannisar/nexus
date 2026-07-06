const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserProfile, listUsers } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/", protect, listUsers); // ?role=investor or ?role=entrepreneur
router.put("/profile", protect, updateUserProfile);
router.get("/:id", protect, getUserProfile);

module.exports = router;
