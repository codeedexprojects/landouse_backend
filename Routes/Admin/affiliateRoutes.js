const express = require('express');
const router = express.Router();
const affiliateController = require('../../Controller/Admin/affiliateController');

// Create new affiliate
router.post('/create', affiliateController.createAffiliate);

// Get all affiliates
router.get('/', affiliateController.getAllAffiliates);

// Update affiliate amount
router.put('/update/:affiliateId', affiliateController.updateAffiliateAmount);

// Delete affiliate
router.delete('/delete/:affiliateId', affiliateController.deleteAffiliate);

module.exports = router;
 