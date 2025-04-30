// routes/vendorRoutes.js
const express = require('express');
const { authMiddleware } = require('../../Middlewares/jwtMiddleware'); 
const { sendOtpForRegistration, verifyRegistrationOtp, sendOtpForLogin, verifyLoginOtp, updateProfile } = require('../../Controller/Vendor/authController');
const router = express.Router();

router.post('/send-otp/register',sendOtpForRegistration);
router.post('/verify-otp/register',verifyRegistrationOtp);

router.post('/send-otp/login', sendOtpForLogin);
router.post('/verify-otp/login', verifyLoginOtp);

// Vendor route to update profile (after approval)
router.patch('/profile/:vendorId', updateProfile);

module.exports = router;
