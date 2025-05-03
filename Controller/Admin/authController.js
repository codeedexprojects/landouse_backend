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
    //  const token = jwt.sign(
    //       {
    //         id: admin._id,
    //         email: admin.email,
    //         role: 'admin'  
    //       },
    //       process.env.JWT_SECRET,
    //       { expiresIn: "7d" }
    //     );
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
    const adminId = req.admin.id;  // Make sure to get admin id from auth middleware
    const { name, dob, address, number } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Update fields if provided
    if (name) admin.name = name;
    if (dob) admin.dob = dob;
    if (address) admin.address = address;
    if (number) admin.number = number;

    await admin.save();

    res.json({
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        dob: admin.dob,
        address: admin.address,
        number: admin.number,
      },
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports = { registerAdmin, loginAdmin, updateAdminProfile };
