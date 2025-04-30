const express = require('express');
const router = express.Router();
const enquiryController = require('../../Controller/User/enquiryController');
const jwtVerify = require('../../Middlewares/jwtMiddleware')


// Route to create enquiry
router.post('/send/:userId',jwtVerify(['user']), enquiryController.createEnquiry);

// Route to get user's enquiries
router.get('/view/:userId',jwtVerify(['user']), enquiryController.getUserEnquiries);

module.exports = router;
