const Property = require('../../Models/Admin/propertyModel');

exports.addProperty = async (req, res) => {
  try {
    const {
      user_id,
      property_type,
      property_price,
      price_per_cent,
      area,
      buildIn,
      carpet_area,
      car_parking,
      car_access,
      floor,
      road_frontage,
      whats_nearby,
      cent,
      maxrooms,
      beds,
      baths,
      description,
      address,
      zipcode,
      locationmark,
      coordinates,
      private_note
    } = req.body;

    const photos = req.files ? req.files.map(file => file.path) : [];

    // Generate product code
    const generateProductCode = (type) => {
      const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `${(type || 'PRO').slice(0, 3).toUpperCase()}-${randomString}`;
    };
    const productCode = generateProductCode(property_type);

    const newProperty = new Property({
      property_type,
      property_price,
      price_per_cent,
      area,
      carpet_area,
      car_parking,
      car_access,
      floor,
      buildIn,
      road_frontage,
      whats_nearby,
      cent,
      maxrooms,
      beds,
      baths,
      description,
      address,
      zipcode,
      locationmark,
      productCode, // Add productCode here
      coordinates: {
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude
      },
      photos,
      private_note,
      created_by: user_id,
      created_by_model: 'Admin'
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: newProperty
    });
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add property',
      error: error.message
    });
  }
};


exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate({
        path: 'created_by',
       
      });

    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
};


exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.status(200).json({ success: true, property });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const photos = req.files ? req.files.map(file => file.path) : [];
    const updatedData = {
      ...req.body,
      photos
    };
    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!updatedProperty) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, message: 'Property updated', property: updatedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ success: false, message: 'Failed to update property' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ success: false, message: 'Failed to delete property' });
  }
};

exports.changeSoldOutStatus = async (req, res) => {
  const { id } = req.params;
  const { soldOut } = req.body; // Expecting the soldOut value to be passed in the request body
  
  try {
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Update the soldOut field
    property.soldOut = typeof soldOut === 'boolean' ? soldOut : property.soldOut;

    await property.save();

    res.status(200).json({ success: true, message: 'Property soldOut status updated', property });
  } catch (error) {
    console.error('Error updating soldOut status:', error);
    res.status(500).json({ success: false, message: 'Failed to update soldOut status' });
  }
};
