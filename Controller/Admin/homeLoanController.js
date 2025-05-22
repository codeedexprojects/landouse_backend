const HomeLoan = require('../../Models/User/homeLoanModel');
const Property = require('../../Models/Admin/propertyModel');

  
// Get all enquiries (for admin)
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await HomeLoan.find()
      .populate('propertyId') // ← This pulls in property details
      .sort({ createdAt: -1 });

    res.status(200).json({ enquiries });
  } catch (err) {
    console.error('Get enquiries error:', err);
    res.status(500).json({ message: 'Server error while fetching enquiries.' });
  }
};

// Mark a single enquiry as read
exports.markAsRead = async (req, res) => {
  const { enquiryId } = req.params;

  try {
    const enquiry = await HomeLoan.findByIdAndUpdate(
      enquiryId,
      { isRead: true },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    res.status(200).json({ message: 'Enquiry marked as read.', enquiry });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Server error while updating enquiry.' });
  }
};
