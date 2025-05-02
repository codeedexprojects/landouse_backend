const Contact = require('../../Models/User/contactModel');

// Add new contact message
exports.addContactMessage = async (req, res) => {
  try {
    const { name, number, mail, message } = req.body;

    if (!name || !number || !mail || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newMessage = new Contact({ name, number, mail, message });
    await newMessage.save();

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error adding contact message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all contact messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
