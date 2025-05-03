const User = require('../../Models/User/authModel');
const Property = require('../../Models/Admin/propertyModel');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// Get single user by ID
exports.getSingleUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User fetched successfully', user });
  } catch (err) {
    console.error('Get single user error:', err);
    res.status(500).json({ message: 'Server error while fetching user.' });
  }
};

// Update a user by ID
exports.updateUserByAdmin = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, address, invitationCode, isActive } = req.body;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Update fields
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.address = address || user.address;
      user.invitationCode = invitationCode || user.invitationCode;
      if (typeof isActive === 'boolean') user.isActive = isActive;
  
      // ✅ Update profile image if file is uploaded
      if (req.file) {
        user.profileImage = req.file.path; // Save the file path
      }
  
      await user.save();
  
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ message: 'Server error while updating user.' });
    }
  };
  

// Delete user by ID
exports.deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found or already deleted.' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};

exports.getReferralDetails = async (req, res) => {
  try {
    const referredUsers = await User.find({ 'invitedBy.userId': { $exists: true, $ne: null } })
      .populate({
        path: 'invitedBy.userId',
        select: 'firstName lastName'
      })
      .populate({
        path: 'invitedBy.productId',
        model: 'Property', 
        select: 'property_type address' 
      })
      .select('firstName lastName email invitedBy')
      .lean();

    const result = referredUsers.map(user => {
      const propertyInfo = user.invitedBy?.productId 
        ? `${user.invitedBy.productId.property_type} - ${user.invitedBy.productId.address}`
        : 'N/A';

      return {
        referredUser: `${user.firstName} ${user.lastName}`,
        referredEmail: user.email,
        property: propertyInfo,
        referralCode: user.invitedBy?.referralCode || 'N/A',
        referrer: user.invitedBy?.userId
          ? `${user.invitedBy.userId.firstName} ${user.invitedBy.userId.lastName}`
          : 'N/A'
      };
    });

    res.status(200).json({
      message: 'Referral details fetched successfully',
      referrals: result
    });
  } catch (err) {
    console.error('Error fetching referral details:', err);
    res.status(500).json({ message: 'Server error while fetching referral details.' });
  }
};
