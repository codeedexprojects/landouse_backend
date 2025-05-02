const express = require('express');
const router = express.Router();
const contactController = require('../../Controller/User/contactController');

// POST /api/contact
router.post('/create', contactController.addContactMessage);

// GET /api/contact
router.get('/view', contactController.getAllMessages);

module.exports = router;
