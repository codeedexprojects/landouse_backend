const Enquiry = require('../../Models/User/EnquiryModel');

// Create a new enquiry (userId from params)
exports.createEnquiry = async (req, res) => {
  const { name, phoneNumber, email, message, propertyId } = req.body;
  const { userId } = req.params; // 👈 Get userId from URL params

  try {
    const newEnquiry = new Enquiry({
      userId,
      propertyId,
      name,
      phoneNumber,
      email,
      message
    });

    await newEnquiry.save();

    res.status(201).json({ message: 'Enquiry submitted successfully.', enquiry: newEnquiry });
  } catch (err) {
    console.error('Enquiry error:', err);
    res.status(500).json({ message: 'Server error while submitting enquiry.' });
  }
};

// Get enquiries by userId from params
exports.getUserEnquiries = async (req, res) => {
  const { userId } = req.params; // 👈 Get userId from URL params

  try {
    const enquiries = await Enquiry.find({ userId }).populate('propertyId', 'title address');
    res.status(200).json({ enquiries });
  } catch (err) {
    console.error('Fetch enquiry error:', err);
    res.status(500).json({ message: 'Server error while fetching enquiries.' });
  }
};
