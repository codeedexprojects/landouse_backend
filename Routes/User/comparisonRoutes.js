const express = require('express');
const router = express.Router();
const compareController = require('../../Controller/User/comparisonController');

// Add a property to compare list
router.post('/add', compareController.addToCompare);

// Get properties in compare list
router.get('/list/:userId', compareController.getCompareList);

// Remove a property from compare list
router.delete('/remove/:propertyId', compareController.removeFromCompare);

module.exports = router;
