const express = require('express');
const router = express.Router();
const { 
  sendRegistrationOTP,
  registerUser,
  sendLoginOTP,
  loginUser,
  resendOTP,
  updateProfile, 
  getProfile 
} = require('../../Controller/User/authController');
const { upload } = require('../../Middlewares/multerMiddleware');

// Registration flow
router.post('/register/send-otp', sendRegistrationOTP); 
router.post('/register/verify', registerUser);          

// Login flow
router.post('/login/send-otp', sendLoginOTP);          
router.post('/login/verify', loginUser);                

// OTP management
router.post('/resend-otp', resendOTP);              

// Profile management
router.put('/profile/:userId', upload.single('profileImage'), updateProfile);
router.get('/profile/view/:userId', getProfile);

module.exports = router;