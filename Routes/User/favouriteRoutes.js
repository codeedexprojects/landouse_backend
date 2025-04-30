const express = require('express');
const router = express.Router();
const favouriteController = require('../../Controller/User/favouriteController');

// Add to favourites
router.post('/add', favouriteController.addToFavourite);

// Get user's favourites
router.get('/get/:userId', favouriteController.getUserFavourites);

// Remove from favourites
router.delete('/remove/:propertyId', favouriteController.removeFromFavourite);

module.exports = router;
