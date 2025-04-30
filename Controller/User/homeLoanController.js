const HomeLoan = require('../../Models/User/homeLoanModel');

// Create loan enquiry
exports.createLoanEnquiry = async (req, res) => {
    const { userId, name, number, occupation, typeOfLoan, monthlySalary } = req.body;
  
    if (!userId || !name || !number || !occupation || !typeOfLoan || !monthlySalary) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      const enquiry = new HomeLoan({
        userId,
        name,
        number,
        occupation,
        typeOfLoan,
        monthlySalary
      });
  
      await enquiry.save();
      res.status(201).json({ message: 'Home loan enquiry submitted successfully.', enquiry });
    } catch (err) {
      console.error('Create enquiry error:', err);
      res.status(500).json({ message: 'Server error while submitting enquiry.' });
    }
  };
  
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
