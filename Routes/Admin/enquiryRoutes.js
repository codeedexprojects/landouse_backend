const express = require('express');
const router = express.Router();
const adminEnquiryController = require('../../Controller/Admin/enquiryController');

// Get all enquiries
router.get('/get', adminEnquiryController.getAllEnquiries);

// Delete an enquiry
router.delete('/delete/:enquiryId', adminEnquiryController.deleteEnquiry);

router.get('/property/:productId', adminEnquiryController.getEnquiriesByProductId);

router.get('/unread-count', adminEnquiryController.getUnreadEnquiryCount);
router.patch('/:enquiryId/mark-read', adminEnquiryController.markEnquiryAsRead);


module.exports = router;
