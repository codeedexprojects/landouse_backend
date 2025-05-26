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
      private_note,
      isFeatured = true,
      isLatest = false
    } = req.body;

    const photos = req.files ? req.files.map(file => file.location) : [];


    // Generate product code
    const generateProductCode = async () => {
      try {
        // First try to find the highest L-prefixed numeric code
        const properties = await Property.find({
          productCode: { $regex: /^L\d+$/ } // Only codes starting with L followed by digits
        })
          .sort({ productCode: -1 })
          .limit(1)
          .select('productCode');

        let lastCode = 0;
        if (properties.length > 0 && properties[0].productCode) {
          const code = properties[0].productCode;
          const numericPart = code.substring(1); // Remove the 'L'
          lastCode = parseInt(numericPart, 10) || 0;
        }

        // If no valid codes found, check if we have any properties at all
        if (lastCode === 0) {
          const count = await Property.countDocuments();
          if (count === 0) {
            return 'L001'; // First property ever
          }
        }

        const newCodeNumber = (lastCode + 1).toString().padStart(3, '0');
        return `L${newCodeNumber}`;

      } catch (error) {
        console.error("Error generating product code:", error);
        // Fallback mechanism
        const count = await Property.countDocuments();
        return `L${(count + 1).toString().padStart(3, '0')}`;
      }
    };

    const productCode = await generateProductCode();


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
      isFeatured,
      isLatest,
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

      })
      .sort({ created_at: -1 });

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
    const existingProperty = await Property.findById(req.params.id);
    if (!existingProperty) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Prepare update data
    const updatedData = { ...req.body };

    // Handle photos only if photo-related data is sent
    if (req.body.existing_photos || req.files) {
      let finalPhotos = [];
      
      // Add existing photos to keep
      if (req.body.existing_photos) {
        const existingPhotos = Array.isArray(req.body.existing_photos) 
          ? req.body.existing_photos 
          : [req.body.existing_photos];
        finalPhotos = [...existingPhotos];
      }
      
      // Add new uploaded photos
      if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(file => file.location);
        finalPhotos = [...finalPhotos, ...newPhotos];
      }
      
      updatedData.photos = finalPhotos;
    }
    // If no photo data is sent, don't update photos field at all

    // Clean up helper fields
    delete updatedData.existing_photos;
    delete updatedData.photos_to_remove;

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Property updated successfully', 
      property: updatedProperty 
    });

  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update property' 
    });
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

exports.approveProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.isApproved = true;
    await property.save();

    res.status(200).json({ success: true, message: 'Property approved', property });
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({ success: false, message: 'Failed to approve property' });
  }
};

exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isApproved: false })
      .populate('created_by', 'name email role')
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending properties' });
  }
};
