const Admin = require("../../Models/Admin/authModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: "Admin already exists" });

    // Create user
    const admin = new Admin({ name, email, password });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET
    );

    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { name, dob, address, number } = req.body;
    let profileImage;

    // Check if file was uploaded (requires multer)
    if (req.file) {
      profileImage = req.file.location;
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (name) admin.name = name;
    if (dob) admin.dob = dob;
    if (address) admin.address = address;
    if (number) admin.number = number;
    if (profileImage) admin.profileImage = profileImage;

    await admin.save();

    // Format DOB for response
    const formattedDob = admin.dob ? admin.dob.toISOString().split('T')[0] : null;

    res.json({
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        dob: formattedDob,   
        address: admin.address,
        number: admin.number,
        profileImage: admin.profileImage,
      },
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.params.id;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Format DOB for response
    const formattedDob = admin.dob ? admin.dob.toISOString().split('T')[0] : null;

    res.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        dob: formattedDob, // ✅ formatted YYYY-MM-DD
        address: admin.address,
        number: admin.number,
        profileImage: admin.profileImage, // ✅ include image
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



module.exports = { registerAdmin, loginAdmin, updateAdminProfile, getAdminProfile };
