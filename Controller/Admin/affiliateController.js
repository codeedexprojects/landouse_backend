const Affiliate = require('../../Models/Affiliate/authModel');
const User = require('../../Models/User/authModel'); 

const generateReferralId = (name = '') => {
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${name.slice(0, 3).toUpperCase()}-${randomString}`;
};


exports.adminAddAffiliate = async (req, res) => {
  const { name, number, role } = req.body;
  if (!name || !number || !role) {
    return res.status(400).json({ message: 'Name, number, and role are required' });
  }
  
  try {
    const referralId = generateReferralId(name);
    const affiliate = new Affiliate({
      name,
      number,
      role,
      isApproved: true,
      referralId
    });
    await affiliate.save();

    res.json({ message: 'Affiliate added and approved', affiliate });
  } catch (err) {
    console.error('Error in adminAddAffiliate:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.approveAffiliate = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) return res.status(400).json({ message: 'Affiliate not found' });

    affiliate.isApproved = true;
    await affiliate.save();

    res.json({ message: 'Affiliate approved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAffiliates = async (req, res) => {
  try {
    const affiliates = await Affiliate.find().sort({ createdAt: -1 }); // latest first

    const affiliatesWithCounts = await Promise.all(
      affiliates.map(async (affiliate) => {
        const userCount = await User.countDocuments({ 'invitedBy.referralCode': affiliate.referralId });
        return {
          ...affiliate.toObject(),
          userCount
        };
      })
    );

    res.json({ affiliates: affiliatesWithCounts });
  } catch (err) {
    console.error('Error in getAffiliates:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAffiliateAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    affiliate.amount = amount;
    await affiliate.save();

    res.json({ message: 'Affiliate amount updated', affiliate });
  } catch (err) {
    console.error('Error in updateAffiliateAmount:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getApprovalRequests = async (req, res) => {
  try {
    const approvalRequests = await Affiliate.find({ isApproved: false }).sort({ createdAt: -1 });

    res.json({ approvalRequests });
  } catch (err) {
    console.error('Error in getApprovalRequests:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
