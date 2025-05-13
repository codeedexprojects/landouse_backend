const Place = require('../../Models/Admin/placeModel');

// Add a new district
exports.addDistrict = async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await Place.findOne({ name });
    if (exists) return res.status(400).json({ message: 'District already exists' });

    const district = new Place({ name, subPlaces: [] });
    await district.save();
    res.status(201).json({ message: 'District added successfully', district });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add a sub-place to a district
exports.addSubPlace = async (req, res) => {
  try {
    const { districtId, subPlaceName } = req.body;

    const district = await Place.findById(districtId);
    if (!district) return res.status(404).json({ message: 'District not found' });

    district.subPlaces.push({ name: subPlaceName });
    await district.save();

    res.status(200).json({ message: 'Sub-place added successfully', district });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all districts with sub-places
exports.getAllDistricts = async (req, res) => {
  try {
    const places = await Place.find();
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete a sub-place from a district
exports.deleteSubPlace = async (req, res) => {
  try {
    const { districtId, subPlaceId } = req.params;

    const updatedDistrict = await Place.findByIdAndUpdate(
      districtId,
      { $pull: { subPlaces: { _id: subPlaceId } } },
      { new: true }
    );

    if (!updatedDistrict) {
      return res.status(404).json({ message: 'District not found' });
    }

    res.status(200).json({ message: 'Sub-place deleted successfully', district: updatedDistrict });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
