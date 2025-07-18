const Enquiry = require('../../Models/User/EnquiryModel');

// Get all enquiries (Admin)
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('userId', 'firstName lastName phoneNumber email') // populate user info
      .populate({
        path: 'propertyId',
        populate: {
          path: 'created_by' 
        }
      });


    res.status(200).json({ enquiries });
  } catch (err) {
    console.error('Error fetching all enquiries:', err);
    res.status(500).json({ message: 'Server error while fetching all enquiries.' });
  }
};

// Delete enquiry by ID (Admin)
exports.deleteEnquiry = async (req, res) => {
  const { enquiryId } = req.params;

  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(enquiryId);

    if (!deletedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    res.status(200).json({ message: 'Enquiry deleted successfully.' });
  } catch (err) {
    console.error('Error deleting enquiry:', err);
    res.status(500).json({ message: 'Server error while deleting enquiry.' });
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

exports.getUnreadEnquiryCount = async (req, res) => {
  try {
    const unreadCount = await Enquiry.countDocuments({ isRead: false });
    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error('Error fetching unread enquiry count:', err);
    res.status(500).json({ message: 'Server error while fetching unread enquiry count.' });
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
