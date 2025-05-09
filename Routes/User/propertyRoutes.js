const express = require('express');
const router = express.Router();
const propertyController = require('../../Controller/User/propertyController');
const jwtVerify = require('../../Middlewares/jwtMiddleware')



// Get all properties (for admin/vendor dashboard view)
router.get('/get', propertyController.getAllProperties);

// Optional: get single property
router.get('/get/:id',jwtVerify(['user']), propertyController.getPropertyById);


module.exports = router;
