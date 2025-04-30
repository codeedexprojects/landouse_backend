const Compare = require('../../Models/User/comparisonModel');

// Add property to compare list (max 2)
exports.addToCompare = async (req, res) => {
  
  const { propertyId ,userId} = req.body;

  if (!userId || !propertyId) {
    return res.status(400).json({ message: 'userId and propertyId are required.' });
  }

  try {
    let compare = await Compare.findOne({ userId });

    if (!compare) {
      compare = new Compare({ userId, properties: [propertyId] });
    } else {
      if (compare.properties.includes(propertyId)) {
        return res.status(400).json({ message: 'Property already added for comparison.' });
      }
      if (compare.properties.length >= 2) {
        return res.status(400).json({ message: 'Only two properties can be compared.' });
      }
      compare.properties.push(propertyId);
    }

    await compare.save();
    res.status(200).json({ message: 'Property added to compare list.', compare });
  } catch (err) {
    console.error('Add to compare error:', err);
    res.status(500).json({ message: 'Server error while adding to compare list.' });
  }
};

// Get compare list for user
exports.getCompareList = async (req, res) => {
  const {userId} = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'userId header is required.' });
  }

  try {
    const compare = await Compare.findOne({ userId }).populate('properties');

    if (!compare) {
      return res.status(200).json({ properties: [] });
    }

    res.status(200).json({ properties: compare.properties });
  } catch (err) {
    console.error('Get compare error:', err);
    res.status(500).json({ message: 'Server error while fetching compare list.' });
  }
};

// Remove property from compare list
exports.removeFromCompare = async (req, res) => {
  const {userId} = req.body;
  const { propertyId } = req.params;

  if (!userId || !propertyId) {
    return res.status(400).json({ message: 'userId and propertyId are required.' });
  }

  try {
    const compare = await Compare.findOne({ userId });

    if (!compare) {
      return res.status(404).json({ message: 'Compare list not found.' });
    }

    compare.properties = compare.properties.filter(
      id => id.toString() !== propertyId
    );

    await compare.save();
    res.status(200).json({ message: 'Property removed from compare list.', compare });
  } catch (err) {
    console.error('Remove from compare error:', err);
    res.status(500).json({ message: 'Server error while removing property.' });
  }
};
