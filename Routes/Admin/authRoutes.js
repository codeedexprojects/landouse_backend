const express = require("express");
const { registerAdmin, loginAdmin, updateAdminProfile } = require("../../Controller/Admin/authController");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.put('/profile', updateAdminProfile);

module.exports = router;
