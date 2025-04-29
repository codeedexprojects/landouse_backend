// controllers/vendorController.js
const Vendor = require('../../Models/Vendor/vendorModel');
const jwt = require('jsonwebtoken');
const OTPs = {};
const sendOtp = require('../../utils/sendOTP');


exports.sendOtpToVendor = async (req, res) => {
    const { number } = req.body;
  
    try {
      // Use hardcoded OTP for testing
      const otp = '123456';
      
      // Store the OTP with the number in memory
      OTPs[number] = otp;
  
      // Send OTP to vendor's phone
      await sendOtp(number, otp);
      
      res.status(200).json({ message: `OTP sent successfully to ${number}` });
    } catch (err) {
      console.error('Error sending OTP:', err);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
};

//login
exports.loginOrRegisterVendor = async (req, res) => {
    const { number, otp } = req.body;
  
    try {
      // Step 1: Validate OTP
      if (!otp || otp !== OTPs[number]) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Step 2: Check if vendor exists
      let vendor = await Vendor.findOne({ number });
  
      if (!vendor) {
        // Step 3: Vendor does not exist => Create vendor with approvalStatus as false
        vendor = new Vendor({
          number,
          approvalStatus: false, // Admin approval pending
        });
  
        await vendor.save();
  
        // OTP expires, remove it from memory
        delete OTPs[number];
  
        return res.status(201).json({
          message: 'Vendor registered successfully. Awaiting admin approval.',
        });
      }
  
      // Step 4: If vendor exists, check approval
      if (!vendor.approvalStatus) {
        // OTP expires, remove it from memory
        delete OTPs[number];
  
        return res.status(403).json({
          message: 'Account pending approval by admin.',
        });
      }
  
      // Step 5: Vendor exists and is approved => Issue JWT token
      const token = jwt.sign({ vendorId: vendor._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      // OTP expires, remove it from memory
      delete OTPs[number];
  
      res.status(200).json({
        message: 'Login successful',
        token,
      });
    } catch (err) {
      console.error('Error in loginOrRegisterVendor:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Update vendor profile after approval using vendorId in URL
exports.updateProfile = async (req, res) => {
    const { state, postCode, email, aboutVendor, profileImage, city, name, role } = req.body;
    const { vendorId } = req.params; // Now getting vendorId from params
  
    try {
      // Step 1: Find the vendor by their ID
      const vendor = await Vendor.findById(vendorId);
  
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
  
      // Step 2: Check if the vendor is approved
      if (!vendor.approvalStatus) {
        return res.status(403).json({ message: 'Vendor not approved by admin yet' });
      }
  
      // Step 3: Update fields, but keep number and approvalStatus unchanged
      vendor.name = name || vendor.name;
      vendor.role = role || vendor.role;
      vendor.city = city || vendor.city;
      vendor.state = state || vendor.state;
      vendor.postCode = postCode || vendor.postCode;
      vendor.email = email || vendor.email;
      vendor.aboutVendor = aboutVendor || vendor.aboutVendor;
      vendor.profileImage = profileImage || vendor.profileImage;
  
      // Step 4: Save the updated vendor
      await vendor.save();
  
      // Step 5: Return a success message
      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
