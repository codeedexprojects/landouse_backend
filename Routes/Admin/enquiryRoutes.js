const express = require('express');
const router = express.Router();
const adminEnquiryController = require('../../Controller/Admin/enquiryController');

// Get all enquiries
router.get('/get', adminEnquiryController.getAllEnquiries);

// Delete an enquiry
router.delete('/delete/:enquiryId', adminEnquiryController.deleteEnquiry);

module.exports = router;
