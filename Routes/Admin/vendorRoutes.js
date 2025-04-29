// routes/adminRoutes.js
const express = require('express');
const { getAllVendors, approveVendor, registerVendor, getVendorById } = require('../../Controller/Admin/vendorController');
const router = express.Router();

router.post('/register', registerVendor);

// Admin route to get all vendors
router.get('/get', getAllVendors);

// Admin route to approve a vendor
router.post('/approve/:id', approveVendor);

router.get('/get/:id',getVendorById);

module.exports = router;
