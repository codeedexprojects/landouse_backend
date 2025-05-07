// routes/adminRoutes.js
const express = require('express');
const { getAllVendors, approveVendor, registerVendor, getVendorById, getVendorPropertyStats, getVendorProperties, deleteVendor, updateVendor, getAllEnquiriesForVendor } = require('../../Controller/Admin/vendorController');
const router = express.Router();
const {upload} = require('../../Middlewares/multerMiddleware'); 


router.post('/register', registerVendor);

// Admin route to get all vendors
router.get('/get', getAllVendors);

// Admin route to approve a vendor
router.post('/approve/:id', approveVendor);

router.get('/get/:id',getVendorById);

router.get('/:id/property-count', getVendorPropertyStats);

router.get('/:id/properties',getVendorProperties);

router.delete('/delete/:id',deleteVendor);

router.patch('/update/:id', upload.single('profileImage'),updateVendor);

router.get('/get/enquiries/:vendorId', getAllEnquiriesForVendor);



module.exports = router;
