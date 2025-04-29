const express = require('express');
const router = express.Router();
const enquiryController = require('../../Controller/User/enquiryController');
// const authenticate = require('../middleware/authMiddleware'); 

// Route to create enquiry
router.post('/send/:userId', enquiryController.createEnquiry);

// Route to get user's enquiries
router.get('/view/:userId', enquiryController.getUserEnquiries);

module.exports = router;
