const Favourite = require('../../Models/User/favouriteModel');

// Add to favourites
exports.addToFavourite = async (req, res) => {
 
  const { propertyId,userId } = req.body;

  try {
    const exists = await Favourite.findOne({ userId, propertyId });

    if (exists) {
      return res.status(400).json({ message: 'Property already in favourites.' });
    }

    const favourite = new Favourite({ userId, propertyId });
    await favourite.save();

    res.status(201).json({ message: 'Added to favourites.', favourite });
  } catch (err) {
    console.error('Add to favourite error:', err);
    res.status(500).json({ message: 'Server error while adding to favourites.' });
  }
};

// Get user's favourites
exports.getUserFavourites = async (req, res) => {
  const {userId} = req.params;

  try {
    const favourites = await Favourite.find({ userId }).populate('propertyId');
    res.status(200).json({ favourites });
  } catch (err) {
    console.error('Get favourites error:', err);
    res.status(500).json({ message: 'Server error while fetching favourites.' });
  }
};

// Remove from favourites
exports.removeFromFavourite = async (req, res) => {
  const { propertyId } = req.params;       
  const { userId } = req.query;  

  try {
    const result = await Favourite.findOneAndDelete({ userId, propertyId });

    if (!result) {
      return res.status(404).json({ message: 'Favourite not found.' });
    }

    res.status(200).json({ message: 'Removed from favourites.' });
  } catch (err) {
    console.error('Remove favourite error:', err);
    res.status(500).json({ message: 'Server error while removing favourite.' });
  }
};
