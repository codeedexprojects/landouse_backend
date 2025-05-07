// routes/vendorRoutes.js
const express = require('express');
const { sendOtpForRegistration, verifyRegistrationOtp, sendOtpForLogin, verifyLoginOtp, updateProfile, getProfile } = require('../../Controller/Vendor/authController');
const router = express.Router();
const {upload} = require('../../Middlewares/multerMiddleware')


router.post('/send-otp/register',sendOtpForRegistration);
router.post('/verify-otp/register',verifyRegistrationOtp);

router.post('/send-otp/login', sendOtpForLogin);
router.post('/verify-otp/login', verifyLoginOtp);

// Vendor route to update profile (after approval)
router.patch('/profile/:vendorId',upload.single('profileImage'), updateProfile);

router.get('/profile/:vendorId', getProfile);


module.exports = router;
