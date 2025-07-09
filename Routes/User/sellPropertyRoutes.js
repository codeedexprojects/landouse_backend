const express = require('express');
const router = express.Router();
const { createPropertySell, getAllPropertySell } = require('../../Controller/User/sellPropertyController');

router.post('/create', createPropertySell);
router.get('/get', getAllPropertySell); 

module.exports = router;
