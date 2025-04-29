const ReferralShare = require('../../Models/User/referralModel');

exports.logReferralShare = async (req, res) => {
  const { productId, referralCode } = req.body;
  const userId = req.user.userId; // from token middleware

  try {
    const newShare = new ReferralShare({
      sharedBy: userId,
      referralCode,
      productId
    });

    await newShare.save();

    res.status(201).json({ message: 'Referral share logged successfully.', data: newShare });
  } catch (err) {
    console.error('Log referral share error:', err);
    res.status(500).json({ message: 'Failed to log referral share.' });
  }
};
