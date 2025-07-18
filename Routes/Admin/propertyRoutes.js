const express = require('express');
const router = express.Router();
const propertyController = require('../../Controller/Admin/propertyController');
const {upload} = require('../../Middlewares/multerMiddleware'); 
const jwtVerify = require('../../Middlewares/jwtMiddleware')


// Admin or Vendor can add a property
router.post('/add', upload.array('photos', 25),jwtVerify(['admin']), propertyController.addProperty);

// Get all properties (for admin/vendor dashboard view)
router.get('/get', jwtVerify(['admin']), propertyController.getAllProperties);

// Optional: get single property
router.get('/:id',jwtVerify(['admin']), propertyController.getPropertyById);

// get pending properties
router.get('/get/pending',jwtVerify(['admin']), propertyController.getPendingProperties);

// Update property
router.patch('/update/:id',jwtVerify(['admin']), upload.array('photos', 15), propertyController.updateProperty);

// approve proerty 
router.patch('/approve/:id',jwtVerify(['admin']), propertyController.approveProperty );

// Delete property
router.delete('/delete/:id',jwtVerify(['admin']), propertyController.deleteProperty);

router.put('/soldout/:id', jwtVerify(['admin']),propertyController.changeSoldOutStatus);



module.exports = router;
