const HomeLoan = require('../../Models/User/homeLoanModel');


  
// Get all enquiries (for admin)
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await HomeLoan.find().sort({ createdAt: -1 });
    res.status(200).json({ enquiries });
  } catch (err) {
    console.error('Get enquiries error:', err);
    res.status(500).json({ message: 'Server error while fetching enquiries.' });
  }
};
