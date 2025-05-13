const express = require('express');
const router = express.Router();
const placeController = require('../../Controller/Admin/placeController');

// Add district
router.post('/main', placeController.addDistrict);

// Add sub-place
router.post('/sub-places', placeController.addSubPlace);

// Get all districts with sub-places
router.get('/get', placeController.getAllDistricts);

// Delete a sub-place
router.delete('/delete/:districtId/:subPlaceId', placeController.deleteSubPlace);


module.exports = router;
