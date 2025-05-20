const Enquiry = require('../../Models/User/EnquiryModel');
const Property = require('../../Models/Admin/propertyModel');
const moment = require('moment');

// Get all enquiries for properties of a vendor (vendorId from req.params)
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

// Get enquiry details by enquiry ID (vendorId from req.params)
exports.getEnquiryById = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const enquiryId = req.params.id;

    const enquiry = await Enquiry.findById(enquiryId)
      .populate('userId', 'name email')
      .populate('propertyId', 'property_type property_price address created_by');

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (enquiry.propertyId.created_by.toString() !== vendorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this enquiry' });
    }

    res.status(200).json({ success: true, enquiry });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enquiry' });
  }
};

// Delete enquiry (vendorId from req.params)
exports.deleteEnquiry = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const enquiryId = req.params.id;

    const enquiry = await Enquiry.findById(enquiryId).populate('propertyId');

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (enquiry.propertyId.created_by.toString() !== vendorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to delete this enquiry' });
    }

    await Enquiry.findByIdAndDelete(enquiryId);

    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to delete enquiry' });
  }
};


exports.getEnquiryStatsForVendor = async (req, res) => {
    try {
      const vendorId = req.params.vendorId;
      const { filter } = req.query; // filter = daily | weekly | monthly | yearly
  
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(filter)) {
        return res.status(400).json({ success: false, message: 'Invalid filter. Use daily, weekly, monthly, or yearly.' });
      }
  
      // Find vendor's property IDs
      const vendorProperties = await Property.find({ created_by: vendorId }, '_id');
      const propertyIds = vendorProperties.map(p => p._id);
  
      let startDate, endDate, prevStartDate, prevEndDate;
  
      if (filter === 'daily') {
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
        prevStartDate = moment().subtract(1, 'day').startOf('day');
        prevEndDate = moment().subtract(1, 'day').endOf('day');
      } else if (filter === 'weekly') {
        startDate = moment().startOf('isoWeek');
        endDate = moment().endOf('isoWeek');
        prevStartDate = moment().subtract(1, 'week').startOf('isoWeek');
        prevEndDate = moment().subtract(1, 'week').endOf('isoWeek');
      } else if (filter === 'monthly') {
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        prevStartDate = moment().subtract(1, 'month').startOf('month');
        prevEndDate = moment().subtract(1, 'month').endOf('month');
      } else if (filter === 'yearly') {
        startDate = moment().startOf('year');
        endDate = moment().endOf('year');
        prevStartDate = moment().subtract(1, 'year').startOf('year');
        prevEndDate = moment().subtract(1, 'year').endOf('year');
      }
  
      // Count current period enquiries
      const currentEnquiries = await Enquiry.countDocuments({
        propertyId: { $in: propertyIds },
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
      });
  
      // Count previous period enquiries
      const previousEnquiries = await Enquiry.countDocuments({
        propertyId: { $in: propertyIds },
        createdAt: { $gte: prevStartDate.toDate(), $lte: prevEndDate.toDate() }
      });
  
      // Calculate percentage increase
      let percentageChange = 0;
      if (previousEnquiries === 0 && currentEnquiries > 0) {
        percentageChange = 100;
      } else if (previousEnquiries === 0 && currentEnquiries === 0) {
        percentageChange = 0;
      } else {
        percentageChange = ((currentEnquiries - previousEnquiries) / previousEnquiries) * 100;
      }
  
      res.status(200).json({
        success: true,
        filter,
        totalEnquiries: currentEnquiries,
        percentageChange: Math.round(percentageChange * 100) / 100 // rounded to 2 decimal places
      });
  
    } catch (error) {
      console.error('Error fetching enquiry stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch enquiry stats' });
    }
  };

  // Get enquiry counts for a vendor
exports.getEnquiryCountsForVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    // Get vendor's property IDs
    const vendorProperties = await Property.find({ created_by: vendorId }, '_id');
    const propertyIds = vendorProperties.map(p => p._id);

    // Get counts
    const totalEnquiries = await Enquiry.countDocuments({ propertyId: { $in: propertyIds } });
    const unreadEnquiries = await Enquiry.countDocuments({ propertyId: { $in: propertyIds }, isRead: false });
    const readEnquiries = await Enquiry.countDocuments({ propertyId: { $in: propertyIds }, isRead: true });

    res.status(200).json({
      success: true,
      totalEnquiries,
      readEnquiries,
      unreadEnquiries
    });
  } catch (error) {
    console.error('Error fetching enquiry counts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enquiry counts' });
  }
};


exports.markEnquiryAsRead = async (req, res) => {
  const { enquiryId } = req.params;

  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { isRead: true },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    res.status(200).json({ message: 'Enquiry marked as read.', enquiry });
  } catch (err) {
    console.error('Error marking enquiry as read:', err);
    res.status(500).json({ message: 'Server error while marking enquiry as read.' });
  }
};

exports.getEnquiriesByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const enquiries = await Enquiry.find({ propertyId: productId })
      .populate('userId', 'firstName lastName phoneNumber email') // user info
      .populate('propertyId', 'title address'); // product info

    if (!enquiries || enquiries.length === 0) {
      return res.status(404).json({ message: 'No enquiries found for this product.' });
    }

    res.status(200).json({ enquiries });
  } catch (err) {
    console.error('Error fetching enquiries for product:', err);
    res.status(500).json({ message: 'Server error while fetching enquiries.' });
  }
};