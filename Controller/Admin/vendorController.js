const Vendor = require('../../Models/Vendor/vendorModel');


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