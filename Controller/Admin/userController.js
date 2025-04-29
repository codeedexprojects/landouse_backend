const User = require('../../Models/User/authModel');

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
