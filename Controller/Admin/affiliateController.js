const Affiliate = require('../../Models/Admin/affiliateModel');

// Generate Referral Id
const generateReferralId = (name) => {
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${name.slice(0, 3).toUpperCase()}-${randomString}`;
};

// Add new affiliate
exports.createAffiliate = async (req, res) => {
  try {
    const { name, role, number, affiliateAmount } = req.body;

    if (!name || !role || !number) {
      return res.status(400).json({ message: 'Name, role, and number are required' });
    }

    const referralCode = generateReferralId(name);

    const newAffiliate = new Affiliate({
      name,
      role,
      number,
      referralCode,
      affiliateAmount: affiliateAmount || 0  // default to 0 if not provided
    });

    await newAffiliate.save();

    res.status(201).json({ message: 'Affiliate created successfully', affiliate: newAffiliate });
  } catch (error) {
    console.error('Error creating affiliate:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all affiliates
exports.getAllAffiliates = async (req, res) => {
  try {
    const affiliates = await Affiliate.find().sort({ createdAt: -1 });
    res.status(200).json(affiliates);
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update affiliate amount
exports.updateAffiliateAmount = async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { affiliateAmount } = req.body;

    if (!affiliateAmount) {
      return res.status(400).json({ message: 'Affiliate amount is required' });
    }

    const affiliate = await Affiliate.findById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    affiliate.affiliateAmount = affiliateAmount;

    await affiliate.save();

    res.status(200).json({ message: 'Affiliate amount updated successfully', affiliate });
  } catch (error) {
    console.error('Error updating affiliate amount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete affiliate
exports.deleteAffiliate = async (req, res) => {
  try {
    const { affiliateId } = req.params;

    const affiliate = await Affiliate.findById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    await affiliate.remove();

    res.status(200).json({ message: 'Affiliate deleted successfully' });
  } catch (error) {
    console.error('Error deleting affiliate:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
