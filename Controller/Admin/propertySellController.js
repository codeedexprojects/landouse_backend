const PropertySell = require('../../Models/User/sellPropertyModel');


exports.getAllPropertySell = async (req, res) => {
  try {
    const properties = await PropertySell.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error('Error fetching property sell data:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


exports.updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status: true or false

    if (typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Status must be true or false' });
    }

    const updated = await PropertySell.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating property status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};