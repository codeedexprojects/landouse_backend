const express = require('express');
const router = express.Router();
const homeLoanController = require('../../Controller/User/homeLoanController');
const jwtVerify = require('../../Middlewares/jwtMiddleware')


// Submit home loan enquiry
router.post('/create',jwtVerify(['user']), homeLoanController.createLoanEnquiry);

// Get all enquiries (admin use)
router.get('/all',jwtVerify(['user']), homeLoanController.getAllEnquiries);

module.exports = router;
