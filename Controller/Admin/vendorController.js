const Vendor = require('../../Models/Vendor/vendorModel');
const Property = require('../../Models/Admin/propertyModel');
const Enquiry = require('../../Models/User/EnquiryModel')

// Get all vendors for admin to approve
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json(vendors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve vendor request
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.approvalStatus = true;
    await vendor.save();

    res.status(200).json({ message: 'Vendor approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerVendor = async (req, res) => {
  const { name, number, role, city } = req.body;

  try {
    const existingVendor = await Vendor.findOne({ number });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor already registered' });
    }

    const newVendor = new Vendor({
      name,
      number,
      role,
      city,
      approvalStatus: true, // Automatically approved when registered by admin
    });

    await newVendor.save();

    res.status(200).json({
      message: 'Vendor registered and approved by admin successfully.',
      data: newVendor,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVendorPropertyStats = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Get total properties
    const totalCount = await Property.countDocuments({
      created_by: vendorId,
      created_by_model: 'Vendor'
    });

    // Get sold properties count
    const soldCount = await Property.countDocuments({
      created_by: vendorId,
      created_by_model: 'Vendor',
      soldOut: true
    });

    // Get active (unsold) properties count
    const activeCount = await Property.countDocuments({
      created_by: vendorId,
      created_by_model: 'Vendor',
      soldOut: false
    });

    res.status(200).json({
      success: true,
      vendorId: vendor._id,
      vendorName: vendor.name,
      totalProperties: totalCount,
      soldProperties: soldCount,
      activeProperties: activeCount
    });

  } catch (err) {
    console.error('Error fetching vendor property stats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property stats'
    });
  }
};

// Get all properties for a specific vendor
exports.getVendorProperties = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get all properties for this vendor
    const properties = await Property.find({
      created_by: vendorId,
      created_by_model: 'Vendor'
    }).select('-__v'); // Exclude the __v field

    res.status(200).json({
      success: true,
      count: properties.length,
      vendorId: vendor._id,
      vendorName: vendor.name,
      data: properties
    });

  } catch (err) {
    console.error('Error fetching vendor properties:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendor properties'
    });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Delete vendor properties
    await Property.deleteMany({
      created_by: vendor._id,
      created_by_model: 'Vendor'
    });

    await vendor.deleteOne();

    res.status(200).json({ message: 'Vendor and associated properties deleted successfully.' });
  } catch (err) {
    console.error('Error deleting vendor:', err);
    res.status(500).json({ message: 'Server error while deleting vendor.' });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const updateData = req.body; 

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // If a new image is uploaded
    if (req.file) {
      updateData.profileImage = req.file.location; // or req.file.path if you want full path
    }

    // Update vendor fields
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updateData },
      { new: true } // return updated document
    );

    res.status(200).json({
      message: 'Vendor updated successfully',
      data: updatedVendor
    });
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ message: 'Server error while updating vendor' });
  }
};


exports.getAllEnquiriesForVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId; // get vendorId from route params

    // Find properties created by vendor
    const vendorProperties = await Property.find({ created_by: vendorId }, '_id');

    const propertyIds = vendorProperties.map(property => property._id);

    // Find enquiries linked to vendor's properties
    const enquiries = await Enquiry.find({ propertyId: { $in: propertyIds } })
      .populate('userId', 'name email')
      .populate('propertyId', 'property_type property_price address');

    res.status(200).json({ success: true, enquiries });
  } catch (error) {
    console.error('Error fetching vendor enquiries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries' });
  }
};