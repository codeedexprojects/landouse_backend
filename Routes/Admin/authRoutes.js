const express = require("express");
const { registerAdmin, loginAdmin } = require("../../Controller/Admin/authController");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

module.exports = router;
