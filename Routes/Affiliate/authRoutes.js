const express = require('express');
const router = express.Router();
const affiliateController = require('../../Controller/Affiliate/authController');

// Registration
router.post('/register', affiliateController.registerAffiliate);
router.post('/verify-otp', affiliateController.verifyOtp);

// Login (with OTP)
router.post('/login/request-otp', affiliateController.requestLoginOtp);
router.post('/login/verify-otp', affiliateController.verifyLoginOtp);

router.get('/profile/:id', affiliateController.getAffiliateProfile)
router.get('/recent-users/:id', affiliateController.getReferredUsers )
router.get('/graphs/:id', affiliateController.getReferredUsersWithStats )


module.exports = router;
