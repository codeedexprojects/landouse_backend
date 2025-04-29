// routes/vendorRoutes.js
const express = require('express');
const { loginOrRegisterVendor, updateProfile, sendOtpToVendor } = require('../../Controller/Vendor/authController');
const { authMiddleware } = require('../../Middlewares/jwtMiddleware'); 
const router = express.Router();

router.post('/send-otp', sendOtpToVendor);

// Vendor route to login with OTP
router.post('/login-register', loginOrRegisterVendor);

// Vendor route to update profile (after approval)
router.patch('/profile/:vendorId', updateProfile);

module.exports = router;
