const express = require('express');
const router = express.Router();
const enquiryController = require('../../Controller/Vendor/enquiryController');

// Get all enquiries for vendor's properties
router.get('/get/:vendorId', enquiryController.getAllEnquiriesForVendor);

// Get specific enquiry by ID
router.get('/:vendorId/enquiries/:id', enquiryController.getEnquiryById);

// Delete enquiry
router.delete('/:vendorId/enquiries/:id', enquiryController.deleteEnquiry);

router.get('/:vendorId/enquiry-stats', enquiryController.getEnquiryStatsForVendor);

router.get('/:vendorId/counts', enquiryController.getEnquiryCountsForVendor);

router.get('/property/:productId', enquiryController.getEnquiriesByProductId);


router.patch('/:enquiryId/mark-read', enquiryController.markEnquiryAsRead);



module.exports = router;
