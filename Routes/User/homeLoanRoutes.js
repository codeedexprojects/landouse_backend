const express = require('express');
const router = express.Router();
const homeLoanController = require('../../Controller/User/homeLoanController');

// Submit home loan enquiry
router.post('/create', homeLoanController.createLoanEnquiry);

// Get all enquiries (admin use)
router.get('/all', homeLoanController.getAllEnquiries);

module.exports = router;
