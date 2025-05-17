const Vendor = require('../../Models/Vendor/vendorModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const OTPs = {};

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

// Step 1: Send OTP for Registration
exports.sendOtpForRegistration = async (req, res) => {
  const { name, role, number, city, state, postCode, email, aboutVendor } = req.body;
  if (!name || !role || !number) {
    return res.status(400).json({ message: 'Name, role, and number are required.' });
  }
  try {
    // Generate a random 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP and user details for verification
    OTPs[number] = {
      otp,
      name,
      role,
      city,
      state,
      postCode,
      email,
      aboutVendor,
      type: 'registration',
      expiresAt: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    };

    // Send OTP using 2Factor API
    await send2FactorOTP(number, otp);

    res.status(200).json({ message: `OTP sent to ${number}` });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Step 2: Verify OTP & Register Vendor
exports.verifyRegistrationOtp = async (req, res) => {
  const { number, otp } = req.body;

  try {
    const data = OTPs[number];

    if (!data || data.otp !== otp || data.type !== 'registration' || Date.now() > data.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    let vendor = await Vendor.findOne({ number });

    if (vendor) {
      return res.status(400).json({ message: 'Vendor already exists. Please login.' });
    }

    vendor = new Vendor({
      number,
      name: data.name,
      role: data.role,
      city: data.city,
      state: data.state,
      postCode: data.postCode,
      email: data.email,
      aboutVendor: data.aboutVendor,
      approvalStatus: false
    });

    await vendor.save();
    delete OTPs[number];

    res.status(201).json({
      message: 'Vendor registered successfully. Awaiting admin approval.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Step 3: Send OTP for Login (with role)
exports.sendOtpForLogin = async (req, res) => {
  const { number, role } = req.body;

  if (!number || !role) {
    return res.status(400).json({ message: 'Number and role are required' });
  }

  try {
    const vendor = await Vendor.findOne({ number, role });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found. Please register.' });
    }

    // Generate a random 6-digit OTP
    const otp = generateOTP();

    // Store OTP with expiration
    OTPs[number] = { 
      otp, 
      role, 
      type: 'login',
      expiresAt: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
    };

    // Send OTP using 2Factor API
    await send2FactorOTP(number, otp);

    res.status(200).json({ message: `OTP sent to ${number}` });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  const { number, otp, role } = req.body;

  if (!number || !otp || !role) {
    return res.status(400).json({ message: 'Number, role, and OTP are required' });
  }

  try {
    const data = OTPs[number];

    if (!data || data.otp !== otp || data.type !== 'login' || data.role !== role || Date.now() > data.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const vendor = await Vendor.findOne({ number, role });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!vendor.approvalStatus) {
      return res.status(403).json({ message: 'Vendor not approved by admin' });
    }

    const token = jwt.sign({ vendorId: vendor._id, role: 'vendor'}, process.env.JWT_SECRET);

    delete OTPs[number];

    // Respond with the vendor ID along with the token
    res.status(200).json({ message: 'Login successful', token, vendorId: vendor._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Update vendor profile after approval using vendorId in URL
exports.updateProfile = async (req, res) => {
  const { state, postCode, email, aboutVendor, city, name, role } = req.body;
  const { vendorId } = req.params; 

  try {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (!vendor.approvalStatus) {
      return res.status(403).json({ message: 'Vendor not approved by admin yet' });
    }

    // Update fields from body
    vendor.name = name || vendor.name;
    vendor.role = role || vendor.role;
    vendor.city = city || vendor.city;
    vendor.state = state || vendor.state;
    vendor.postCode = postCode || vendor.postCode;
    vendor.email = email || vendor.email;
    vendor.aboutVendor = aboutVendor || vendor.aboutVendor;

    // Update profileImage from file upload if exists, else from body
    if (req.file && req.file.location) {
      vendor.profileImage = req.file.location;
    } else if (req.body.profileImage) {
      vendor.profileImage = req.body.profileImage;
    }
    // else keep old profileImage as is

    await vendor.save();

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getProfile = async (req, res) => {
  const { vendorId } = req.params;

  try {
    const vendor = await Vendor.findById(vendorId).select('-__v -password'); // exclude unwanted fields

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({ success: true, vendor });
  } catch (err) {
    console.error('Get Profile error:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};