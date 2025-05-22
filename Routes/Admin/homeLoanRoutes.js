const express = require('express');
const router = express.Router();
const homeLoanController = require('../../Controller/Admin/homeLoanController');

// Get all enquiries (admin use)
router.get('/all', homeLoanController.getAllEnquiries);

router.patch('/mark-read/:enquiryId', homeLoanController.markAsRead);

module.exports = router;
