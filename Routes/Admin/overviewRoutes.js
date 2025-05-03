const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../../Controller/Admin/overviewController');

// Protect this route with admin middleware if needed
router.get('/get', getDashboardOverview);

module.exports = router;
