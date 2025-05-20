const User = require('../../Models/User/authModel');
const jwt = require('jsonwebtoken');
const Affiliate = require('../../Models/Affiliate/authModel');
const axios = require('axios');

// Configure 2Factor API
const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY; 
const OTP_TEMPLATE = 'Your OTP for verification is {otp}. Valid for 10 minutes.';

// Generate referral ID for new users
const generateReferralId = (name) => {
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${name.slice(0, 3).toUpperCase()}-${randomString}`;
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via 2Factor API
const sendOTP = async (phoneNumber, otp) => {
  try {
    const message = OTP_TEMPLATE.replace('{otp}', otp);
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${phoneNumber}/${otp}`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Store OTP in temporary storage (Redis recommended for production)
// For this example, we'll use a simple in-memory store
const otpStore = new Map();

// Store OTP with expiry (10 minutes)
const storeOTP = (phoneNumber, otp, purpose) => {
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  otpStore.set(phoneNumber, { otp, expiry, purpose });
  
  // Auto cleanup after expiry
  setTimeout(() => {
    if (otpStore.has(phoneNumber) && otpStore.get(phoneNumber).expiry <= Date.now()) {
      otpStore.delete(phoneNumber);
    }
  }, 10 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (phoneNumber, otp, purpose) => {
  if (!otpStore.has(phoneNumber)) {
    return false;
  }
  
  const storedData = otpStore.get(phoneNumber);
  
  if (storedData.expiry <= Date.now()) {
    otpStore.delete(phoneNumber);
    return false;
  }
  
  if (storedData.otp !== otp || storedData.purpose !== purpose) {
    return false;
  }
  
  // OTP verified, remove from store
  otpStore.delete(phoneNumber);
  return true;
};

// Step 1: Send OTP for registration
exports.sendRegistrationOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this phone number.' });
    }
    
    // Generate and send OTP
    const otp = generateOTP();
    await sendOTP(phoneNumber, otp);
    
    // Store OTP for verification
    storeOTP(phoneNumber, otp, 'registration');
    
    res.status(200).json({ 
      message: 'OTP sent successfully for registration.',
      phoneNumber
    });
  } catch (err) {
    console.error('OTP sending error:', err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

// Step 2: Verify OTP and complete registration
exports.registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    address,
    invitationCode,
    productId,
    otp
  } = req.body;

  try {
    // Verify OTP
    const isOTPValid = verifyOTP(phoneNumber, otp, 'registration');
    if (!isOTPValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    
    // Check if user already exists (double check)
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this phone number.' });
    }

    const referralId = generateReferralId(firstName);
    let invitedBy = null;

    if (invitationCode) {
      // Check if referral code is from User
      const inviter = await User.findOne({ referralId: invitationCode });

      if (inviter) {
        invitedBy = {
          userId: inviter._id,
          referralCode: invitationCode,
          productId: productId || null,
        };
      } else {
        // Check if referral code is from Affiliate
        const affiliate = await Affiliate.findOne({ referralId: invitationCode });
        if (affiliate) {
          invitedBy = {
            referralCode: invitationCode,
            productId: productId || null,
          };
        }
      }
    }
    
    const newUser = new User({
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      referralId,
      invitedBy,
      isVerified: true // User is verified after OTP validation
    });

    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id,
        role: 'user'
      },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      userId: newUser._id,
      referralCode: newUser.referralId,
      user: newUser
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Step 1: Send OTP for login
exports.sendLoginOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }
  
  try {
    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register.' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is deactivated.' });
    }
    
    // Generate and send OTP
    const otp = generateOTP();
    await sendOTP(phoneNumber, otp);
    
    // Store OTP for verification
    storeOTP(phoneNumber, otp, 'login');
    
    res.status(200).json({ 
      message: 'OTP sent successfully for login.',
      phoneNumber
    });
  } catch (err) {
    console.error('OTP sending error:', err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

// Step 2: Verify OTP and complete login
exports.loginUser = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    // Verify OTP
    const isOTPValid = verifyOTP(phoneNumber, otp, 'login');
    if (!isOTPValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is deactivated.' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: 'user'
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({ message: 'Login successful', token, user });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  const { phoneNumber, purpose } = req.body;
  
  if (!phoneNumber || !purpose) {
    return res.status(400).json({ message: 'Phone number and purpose are required.' });
  }
  
  try {
    // Check if user exists for login purpose
    if (purpose === 'login') {
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found. Please register.' });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ message: 'Your account is deactivated.' });
      }
    }
    
    // Generate and send OTP
    const otp = generateOTP();
    await sendOTP(phoneNumber, otp);
    
    // Store OTP for verification
    storeOTP(phoneNumber, otp, purpose);
    
    res.status(200).json({ 
      message: 'OTP resent successfully.',
      phoneNumber
    });
  } catch (err) {
    console.error('OTP resending error:', err);
    res.status(500).json({ message: 'Failed to resend OTP.' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, address, invitationCode } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.address = address || user.address;
    user.invitationCode = invitationCode || user.invitationCode;

    // Image path update
    if (req.file) {
      user.profileImage = req.file.location;
    }

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully.', user });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error during profile update.' });
  }
};

exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile fetched successfully.', user });

  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};