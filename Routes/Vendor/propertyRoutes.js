const express = require('express');
const router = express.Router();
const propertyController = require('../../Controller/Vendor/propertyController');
const {upload} = require('../../Middlewares/multerMiddleware'); 
const jwtVerify = require('../../Middlewares/jwtMiddleware')


// Admin or Vendor can add a property
router.post('/add', upload.array('photos', 10), propertyController.addProperty);

// Get all properties (for admin/vendor dashboard view)
router.get('/get',  propertyController.getAllProperties);

// Optional: get single property
router.get('/:id',propertyController.getPropertyById);

// Update property
router.patch('/update/:id', upload.array('photos', 10), propertyController.updateProperty);

// Delete property
router.delete('/delete/:id', propertyController.deleteProperty);

router.put('/property/soldout/:id', propertyController.changeSoldOutStatus);

module.exports = router;
