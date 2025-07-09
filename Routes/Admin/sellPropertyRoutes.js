const express = require('express');
const router = express.Router();
const { getAllPropertySell, updatePropertyStatus } = require('../../Controller/Admin/propertySellController');

router.get('/get', getAllPropertySell); 

router.patch('/:id/status', updatePropertyStatus);


module.exports = router;
