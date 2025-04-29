const express = require('express');
const router = express.Router();
const { logReferralShare } = require('../../Controller/User/referrelController');
// const authenticateUser = require('../../Middleware/authMiddleware');

router.post('/log-referral-share', logReferralShare);

module.exports = router;
