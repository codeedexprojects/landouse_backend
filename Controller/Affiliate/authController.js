const Affiliate = require('../../Models/Affiliate/authModel');
const jwt = require("jsonwebtoken");
const User = require('../../Models/User/authModel');
const moment = require('moment');
const axios = require('axios');

// 2Factor OTP Configuration
const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY; // Add this to your environment variables
const TWO_FACTOR_TEMPLATE_NAME = 'YourTemplateName'; // Set your template name

// Function to generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP via 2Factor API
const send2FactorOTP = async (number, otp) => {
  try {
    const response = await axios.get('https://2factor.in/API/V1/' + TWO_FACTOR_API_KEY + '/SMS/' + number + '/' + otp + '/' + TWO_FACTOR_TEMPLATE_NAME);
    return response.data;
  } catch (error) {
    console.error('2Factor API Error:', error);
    throw new Error('Failed to send OTP via 2Factor');
  }
};

// Generate referral ID
const generateReferralId = (name) => {
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${name.slice(0, 3).toUpperCase()}-${randomString}`;
};

exports.registerAffiliate = async (req, res) => {
  const { name, number, role } = req.body;
  try {
    let affiliate = await Affiliate.findOne({ number });
    if (affiliate) return res.status(400).json({ message: 'Number already registered' });

    // Generate a random 6-digit OTP
    const otp = generateOTP();
    const referralId = generateReferralId(name);

    // Create the affiliate with OTP
    affiliate = new Affiliate({ 
      name, 
      number, 
      role, 
      otp, 
      referralId,
      otpExpiry: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    });
    await affiliate.save();

    // Send OTP using 2Factor API
    await send2FactorOTP(number, otp);

    res.json({ message: 'OTP sent. Please verify to complete registration' });
  } catch (err) {
    console.error('Register affiliate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { number, otp } = req.body;
  try {
    const affiliate = await Affiliate.findOne({ number });
    if (!affiliate) return res.status(400).json({ message: 'Affiliate not found' });
    
    // Check if OTP has expired
    if (affiliate.otpExpiry && affiliate.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (affiliate.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    // Clear OTP and expiry after successful verification
    affiliate.otp = null;
    affiliate.otpExpiry = null;
    await affiliate.save();

    res.json({ message: 'OTP verified. Waiting for admin approval' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestLoginOtp = async (req, res) => {
  const { number } = req.body;
  try {
    const affiliate = await Affiliate.findOne({ number });
    if (!affiliate) return res.status(400).json({ message: 'Affiliate not found' });

    // Generate a random 6-digit OTP
    const otp = generateOTP();
    
    // Update the affiliate with new OTP and expiry
    affiliate.otp = otp;
    affiliate.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await affiliate.save();

    // Send OTP using 2Factor API
    await send2FactorOTP(number, otp);

    res.json({ message: 'Login OTP sent. Please check your phone.' });
  } catch (err) {
    console.error('Request login OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  const { number, otp } = req.body;
  try {
    const affiliate = await Affiliate.findOne({ number });
    if (!affiliate) return res.status(400).json({ message: 'Affiliate not found' });

    if (!affiliate.isApproved) return res.status(403).json({ message: 'Admin has not approved this affiliate yet' });

    // Check if OTP has expired
    if (affiliate.otpExpiry && affiliate.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (affiliate.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    // Clear OTP and expiry after successful verification
    affiliate.otp = null;
    affiliate.otpExpiry = null;
    await affiliate.save();
    
    const token = jwt.sign(
      { id: affiliate._id, number: affiliate.number, role: affiliate.role },
      process.env.JWT_SECRET
    );

    res.json({
      message: 'Login successful',
      token,
      affiliate: {
        id: affiliate._id,
        name: affiliate.name,
        number: affiliate.number,
        referralId: affiliate.referralId,
        amount: affiliate.amount,
        isApproved: affiliate.isApproved,
      },
    });
  } catch (err) {
    console.error('Verify login OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAffiliateProfile = async (req, res) => {
  try {
    const { id } = req.params; 

    const affiliate = await Affiliate.findById(id).select('-otp -otpExpiry'); // exclude sensitive fields

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    res.status(200).json({ message: 'Affiliate profile fetched successfully', affiliate });
  } catch (err) {
    console.error('Error fetching affiliate profile:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

exports.getReferredUsers = async (req, res) => {
  try {
    const affiliateId = req.params.id; // or get from req.user if using token

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) return res.status(404).json({ message: 'Affiliate not found' });

    // Find users who signed up using this affiliate's referralId
    const referredUsers = await User.find({ 
      'invitedBy.referralCode': affiliate.referralId 
    }).select('-otp -otpExpiry'); // exclude sensitive fields

    res.status(200).json({
      message: `Users referred by affiliate ${affiliate.name}`,
      referredUsers
    });
  } catch (err) {
    console.error('Error fetching referred users:', err);
    res.status(500).json({ message: 'Server error while fetching referred users' });
  }
};

exports.getReferredUsersWithStats = async (req, res) => {
  try {
    const affiliateId = req.params.id; // or get from req.user if using token
    const { period } = req.query; // 'weekly', 'monthly', 'yearly', 'last12hours'
    const affiliate = await Affiliate.findById(affiliateId);

    if (!affiliate) return res.status(404).json({ message: 'Affiliate not found' });

    let filter = { 'invitedBy.referralCode': affiliate.referralId };

    let startDate;
    switch (period) {
      case 'weekly':
        startDate = moment().subtract(7, 'days').toDate();
        break;
      case 'monthly':
        startDate = moment().subtract(1, 'month').toDate();
        break;
      case 'yearly':
        startDate = moment().subtract(1, 'year').toDate();
        break;
      case 'last12hours':
        startDate = moment().subtract(12, 'hours').toDate();
        break;
      default:
        startDate = moment().subtract(1, 'year').toDate(); // Default to last year
        break;
    }

    // Filter users who joined within the time frame
    const referredUsers = await User.find({
      ...filter,
      createdAt: { $gte: startDate } // assuming users have a createdAt timestamp
    });

    // Count the referred users
    const referredCount = referredUsers.length;

    // Calculate the referral stats (12% commission or something else)
    const totalCommission = referredCount * 0.12; // 12% of the referred count (as an example)

    res.status(200).json({
      message: `Referral stats for ${affiliate.name} (${period})`,
      referredCount,
      totalCommission,
      referredUsers
    });
  } catch (err) {
    console.error('Error fetching referred users with stats:', err);
    res.status(500).json({ message: 'Server error while fetching referred users with stats' });
  }
};