const PropertySell = require('../../Models/User/sellPropertyModel');

exports.createPropertySell = async (req, res) => {
  try {
    const { name, phone, propertyType, location, message } = req.body;

    if (!name || !phone || !propertyType || !location) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const newEntry = new PropertySell({ name, phone, propertyType, location, message , status: false });
    const savedEntry = await newEntry.save();

    res.status(201).json({ success: true, data: savedEntry });
  } catch (error) {
    console.error('Error saving property sell:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getAllPropertySell = async (req, res) => {
  try {
    const properties = await PropertySell.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error('Error fetching property sell data:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



