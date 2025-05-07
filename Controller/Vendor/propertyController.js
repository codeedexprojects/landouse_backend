const Property = require('../../Models/Admin/propertyModel');

exports.addProperty = async (req, res) => {
  try {
    const {
      user_id,
      property_type, property_price, area, whats_nearby,
      buildIn, cent, maxrooms, beds, baths,
      description, address, zipcode, locationmark,
      coordinates, private_note
    } = req.body;

    const photos = req.files ? req.files.map(file => file.path) : [];

    const newProperty = new Property({
      property_type,
      property_price,
      area,
      whats_nearby,
      buildIn,
      cent,
      maxrooms,
      beds,
      baths,
      description,
      address,
      zipcode,
      locationmark,
      coordinates: {
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude
      },
      photos,
      private_note,
      created_by: user_id, 
      created_by_model: 'Vendor'
    });

    await newProperty.save();

    res.status(201).json({ success: true, message: "Property added successfully", data: newProperty });
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({ success: false, message: 'Failed to add property', error: error.message });
  }
};

// Updated to only show vendor's properties
exports.getAllProperties = async (req, res) => {
  try {
    const vendorId = req.user.vendorId; // Assuming vendor ID is stored in req.user after authentication
    const properties = await Property.find({ created_by: vendorId }).populate('created_by', 'name email role');
    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
};

// Updated to ensure vendor can only access their own property
exports.getPropertyById = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const property = await Property.findOne({ _id: req.params.id, created_by: vendorId });
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized access' });
    }
    
    res.status(200).json({ success: true, property });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property' });
  }
};

// Updated to ensure vendor can only update their own property
exports.updateProperty = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const property = await Property.findOne({ _id: req.params.id, created_by: vendorId });
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized access' });
    }

    const photos = req.files ? req.files.map(file => file.path) : [];
    const updatedData = {
      ...req.body,
      photos
    };
    
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Property updated', property: updatedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ success: false, message: 'Failed to update property' });
  }
};

// Updated to ensure vendor can only delete their own property
exports.deleteProperty = async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const property = await Property.findOne({ _id: req.params.id, created_by: vendorId });
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized access' });
    }

    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ success: false, message: 'Failed to delete property' });
  }
};

// Updated to ensure vendor can only change status of their own property
exports.changeSoldOutStatus = async (req, res) => {
  const { id } = req.params;
  const { soldOut } = req.body;

  try {
    const vendorId = req.user.vendorId;
    const property = await Property.findOne({ _id: id, created_by: vendorId });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or unauthorized access' });
    }

    property.soldOut = typeof soldOut === 'boolean' ? soldOut : property.soldOut;
    await property.save();

    res.status(200).json({ success: true, message: 'Property soldOut status updated', property });
  } catch (error) {
    console.error('Error updating soldOut status:', error);
    res.status(500).json({ success: false, message: 'Failed to update soldOut status' });
  }
};

// Controller to get counts of properties for a specific vendor (vendorId from params)
exports.getPropertyCounts = async (req, res) => {
  try {
    const vendorId = req.params.vendorId; // Get vendorId from route params

    // Validate vendorId
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    // Count total properties for this vendor
    const totalProperties = await Property.countDocuments({ created_by: vendorId });

    // Count sold properties for this vendor
    const soldProperties = await Property.countDocuments({ created_by: vendorId, soldOut: true });

    res.status(200).json({
      success: true,
      counts: {
        totalProperties,
        soldProperties
      }
    });
  } catch (error) {
    console.error('Error fetching property counts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property counts', error: error.message });
  }
};
