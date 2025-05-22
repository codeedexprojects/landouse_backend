const Property = require('../../Models/Admin/propertyModel');

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ soldOut: false ,isApproved: true }) 
      .populate('created_by', 'name email role')
      .sort({ created_at: -1 }); 

    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate({
        path: 'created_by', // the field to populate
        select: 'name email number ' // select the fields you want
      });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, property });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch property' });
  }
};



