const express = require('express');
const router = express.Router();
const compareController = require('../../Controller/User/comparisonController');
const jwtVerify = require('../../Middlewares/jwtMiddleware')


// Add a property to compare list
router.post('/add',jwtVerify(['user']), compareController.addToCompare);

// Get properties in compare list
router.get('/list/:userId',jwtVerify(['user']), compareController.getCompareList);

// Remove a property from compare list
router.delete('/remove/:propertyId',jwtVerify(['user']), compareController.removeFromCompare);

module.exports = router;
