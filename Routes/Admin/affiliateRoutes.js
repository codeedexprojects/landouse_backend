const express = require('express');
const router = express.Router();
const affiliateController = require('../../Controller/Admin/affiliateController');


router.patch('/approve/:id', affiliateController.approveAffiliate);
router.post('/add', affiliateController.adminAddAffiliate);
router.get('/get', affiliateController.getAffiliates);
router.patch('/update/:id', affiliateController.updateAffiliateAmount);
router.get('/requests', affiliateController.getApprovalRequests);


module.exports = router;
 