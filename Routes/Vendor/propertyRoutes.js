const express = require('express');
const router = express.Router();
const propertyController = require('../../Controller/Vendor/propertyController');
const {upload} = require('../../Middlewares/multerMiddleware'); 
const jwtVerify = require('../../Middlewares/jwtMiddleware')


// Admin or Vendor can add a property
router.post('/add', upload.array('photos', 25),jwtVerify(['vendor']), propertyController.addProperty);

// Get all properties (for admin/vendor dashboard view)
router.get('/get',jwtVerify(['vendor']),  propertyController.getAllProperties);

// Optional: get single property
router.get('/:id',jwtVerify(['vendor']), propertyController.getPropertyById);

// Update property
router.patch('/update/:id',jwtVerify(['vendor']),  upload.array('photos', 15), propertyController.updateProperty);

// Delete property
router.delete('/delete/:id',jwtVerify(['vendor']),  propertyController.deleteProperty);

router.put('/soldout/:id',jwtVerify(['vendor']), propertyController.changeSoldOutStatus);

router.get('/counts/:vendorId', propertyController.getPropertyCounts);


module.exports = router;
