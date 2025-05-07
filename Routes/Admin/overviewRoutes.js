const express = require('express');
const router = express.Router();
const { getDashboardOverview ,getEnquiryStats} = require('../../Controller/Admin/overviewController');

// Protect this route with admin middleware if needed
router.get('/get', getDashboardOverview);
router.get('/enquiry-stats', getEnquiryStats);

module.exports = router;
