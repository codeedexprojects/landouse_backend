const Enquiry = require('../../Models/User/EnquiryModel');

// Get all enquiries (Admin)
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate('userId', 'firstName lastName phoneNumber email') // populate user info
      .populate('propertyId', 'title address'); // populate property info

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
