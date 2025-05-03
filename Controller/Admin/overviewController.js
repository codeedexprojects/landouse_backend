const Property = require('../../Models/Admin/propertyModel');
const User = require('../../Models/User/authModel');
const Enquiry = require('../../Models/User/EnquiryModel');


const getDashboardOverview = async (req, res) => {
  try {
    // Count total properties (admin + vendor)
    const totalProperties = await Property.countDocuments();

    // Count vendor properties (assuming Property has a `vendorId` field)
    const vendorProperties = await Property.countDocuments({ vendorId: { $exists: true } });

    // ✅ Count all registered users
    const totalUsers = await User.countDocuments();

    // Count users by role
    const userCount = await User.countDocuments({ role: 'user' });
    const vendorCount = await User.countDocuments({ role: 'vendor' });

    // Count total enquiries
    const totalEnquiries = await Enquiry.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        vendorProperties,
        totalUsers,   // ➔ total registered users
        userCount,    // ➔ users with role: 'user'
        vendorCount,  // ➔ users with role: 'vendor'
        totalEnquiries,
      },
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard overview' });
  }
};

module.exports = { getDashboardOverview };


module.exports = { getDashboardOverview };
