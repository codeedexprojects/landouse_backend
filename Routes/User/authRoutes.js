const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, getProfile } = require('../../Controller/User/authController');
const {upload} = require('../../Middlewares/multerMiddleware')

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile/:userId', upload.single('profileImage'),updateProfile);
router.get('/profile/view/:userId', getProfile); 

module.exports = router;
