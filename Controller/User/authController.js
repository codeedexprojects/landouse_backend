const User = require('../../Models/User/authModel');
const jwt = require('jsonwebtoken');
const Affiliate = require('../../Models/Affiliate/authModel');

// Register a new user
const generateReferralId = (name) => {
    const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${name.slice(0, 3).toUpperCase()}-${randomString}`;
  };
  
  

  exports.registerUser = async (req, res) => {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      invitationCode,
      productId
    } = req.body;
  
    try {
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
        invitedBy
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
  
  
  

// Login user
exports.loginUser = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
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
        user.profileImage = req.file.path;
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