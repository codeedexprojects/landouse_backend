const express = require('express');
const router = express.Router();
const contactController = require('../../Controller/Admin/contactController');

// GET /api/contact
router.get('/view', contactController.getAllMessages);

module.exports = router;
