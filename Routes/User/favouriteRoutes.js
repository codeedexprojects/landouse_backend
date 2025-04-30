const express = require('express');
const router = express.Router();
const favouriteController = require('../../Controller/User/favouriteController');
const jwtVerify = require('../../Middlewares/jwtMiddleware')


// Add to favourites
router.post('/add',jwtVerify(['user']), favouriteController.addToFavourite);

// Get user's favourites
router.get('/get/:userId',jwtVerify(['user']), favouriteController.getUserFavourites);

// Remove from favourites
router.delete('/remove/:propertyId',jwtVerify(['user']), favouriteController.removeFromFavourite);

module.exports = router;
