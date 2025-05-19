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
        // Count users with this referral code
        const userCount = await User.countDocuments({ 'invitedBy.referralCode': affiliate.referralId });
        
        // Get all users with this referral code to populate userAmounts if needed
        const referredUsers = await User.find({ 'invitedBy.referralCode': affiliate.referralId });
        
        // Initialize userAmounts if it doesn't exist
        const userAmounts = affiliate.userAmounts || {};
        
        // Ensure each referred user has an entry in userAmounts (even if 0)
        referredUsers.forEach(user => {
          if (!userAmounts[user._id]) {
            userAmounts[user._id] = 0;
          }
        });
        
        return {
          ...affiliate.toObject(),
          userCount,
          userAmounts
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
    const { userId, amount } = req.body;
    
    if (userId === undefined || amount === undefined) {
      return res.status(400).json({ message: 'User ID and amount are required' });
    }
    
    // Convert amount to a number
    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      return res.status(400).json({ message: 'Amount must be a valid number' });
    }
    
    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }
    
    // Verify that this user was actually referred by this affiliate
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.invitedBy || user.invitedBy.referralCode !== affiliate.referralId) {
      return res.status(400).json({ message: 'This user was not referred by this affiliate' });
    }
    
    // Initialize userAmounts as a Map if it doesn't exist
    if (!affiliate.userAmounts) {
      affiliate.userAmounts = new Map();
    } else if (!(affiliate.userAmounts instanceof Map)) {
      // Convert existing object to Map if it's not already one
      affiliate.userAmounts = new Map(Object.entries(affiliate.userAmounts));
    }
    
    // Set the amount for this specific user
    affiliate.userAmounts.set(userId.toString(), amountNum);
    
    // Calculate the total amount from all user amounts
    let totalAmount = 0;
    affiliate.userAmounts.forEach((value) => {
      totalAmount += value;
    });
    
    affiliate.amount = totalAmount;
    
    await affiliate.save();
    
    res.json({ 
      message: 'Affiliate amount updated for specific user', 
      affiliate,
      details: {
        userId,
        assignedAmount: amountNum,
        totalAffiliatePayout: totalAmount
      }
    });
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

exports.getReferredUsers = async (req, res) => { 
  try { 
    const affiliateId = req.params.id; // or get from req.user if using token
    
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) return res.status(404).json({ message: 'Affiliate not found' });
    
    // Find users who signed up using this affiliate's referralId
    const referredUsers = await User.find({ 
      'invitedBy.referralCode': affiliate.referralId 
    }).select('-otp'); // optional: exclude fields like otp if exists
    
    res.status(200).json({
      message: `Users referred by affiliate ${affiliate.name}`,
      referredUsers,
      count: referredUsers.length
    });
  } catch (err) { 
    console.error('Error fetching referred users:', err); 
    res.status(500).json({ message: 'Server error while fetching referred users' }); 
  } 
};