const Property = require('../../Models/Admin/propertyModel');
const User = require('../../Models/User/authModel');
const Enquiry = require('../../Models/User/EnquiryModel');
const Vendor = require('../../Models/Vendor/vendorModel');
const moment = require('moment');


const getDashboardOverview = async (req, res) => {
  try {
    // Count total properties (admin + vendor)
    const totalProperties = await Property.countDocuments();

    // Count admin properties
    const adminProperties = await Property.countDocuments({ 
      created_by_model: 'Admin' 
    });

    // Count vendor properties
    const vendorProperties = await Property.countDocuments({ 
      created_by_model: 'Vendor' 
    });

    // Count all registered users
    const totalUsers = await User.countDocuments();

    // ✅ Count referred users → where invitedBy.userId is not null
    const referredUsers = await User.countDocuments({ 'invitedBy.userId': { $exists: true, $ne: null } });

    // Count total enquiries
    const totalEnquiries = await Enquiry.countDocuments();

    // Count total vendors
    const totalVendors = await Vendor.countDocuments();

    // Count approved vendors
    const approvedVendors = await Vendor.countDocuments({ approvalStatus: true });

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        adminProperties,
        vendorProperties,
        totalUsers,
        referredUsers,     // ✅ included in response
        totalEnquiries,
        totalVendors,
        approvedVendors
      },
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard overview' 
    });
  }
};


const getEnquiryStats = async (req, res) => {
  try {
    const { range } = req.query;

    let groupBy;
    let match = {};

    if (range === 'weekly') {
      const last7Days = moment().subtract(6, 'days').startOf('day').toDate();
      match.createdAt = { $gte: last7Days };
      groupBy = { $dayOfWeek: '$createdAt' }; // 1-7 (Sun-Sat)
    } else if (range === 'monthly') {
      const startOfMonth = moment().startOf('month').toDate();
      match.createdAt = { $gte: startOfMonth };
      groupBy = { $dayOfMonth: '$createdAt' }; // 1-31
    } else { // default yearly
      groupBy = { $month: '$createdAt' }; // 1-12
    }

    const stats = await Enquiry.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let data, totalPoints;

    if (range === 'weekly') {
      data = Array(7).fill(0);
      stats.forEach((item) => {
        data[item._id - 1] = item.count;
      });
    } else if (range === 'monthly') {
      const daysInMonth = moment().daysInMonth();
      data = Array(daysInMonth).fill(0);
      stats.forEach((item) => {
        data[item._id - 1] = item.count;
      });
    } else { // yearly
      data = Array(12).fill(0);
      stats.forEach((item) => {
        data[item._id - 1] = item.count;
      });
    }

    const total = data.reduce((sum, val) => sum + val, 0);

    // Calculate % change from last day
    const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
    const dayBefore = moment().subtract(2, 'days').startOf('day').toDate();

    const yesterdayCount = await Enquiry.countDocuments({
      createdAt: { $gte: yesterday },
    });
    const dayBeforeCount = await Enquiry.countDocuments({
      createdAt: { $gte: dayBefore, $lt: yesterday },
    });

    let percentChange = 0;
    if (dayBeforeCount > 0) {
      percentChange = ((yesterdayCount - dayBeforeCount) / dayBeforeCount) * 100;
    }

    res.status(200).json({
      success: true,
      data,
      total,
      percentChange: percentChange.toFixed(1), // e.g., 1.2
    });
  } catch (error) {
    console.error('Enquiry stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry stats',
    });
  }
};
 

module.exports = { getDashboardOverview,getEnquiryStats  };
