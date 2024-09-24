// controllers/messageController.js
const Message = require('../models/message');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: 'smtp.gamil.com',
  port: 465,
  secure: true,
  auth: {
    user: "devdoodleslearner@gmail.com",
    pass: "omosbcwpsmslqacn",
  },
});
exports.getInTouch = async (req, res) => {
  const { name, email, message, phone } = req.body;
 
  try {
    // Create a new message
    const newMessage = new Message({ name, email, message, phone });
    await transporter.sendMail({
      to: 'devdoodleslearner@gmail.com',
      subject: 'Hi, I need to connect',
      text: `User Details are Name: ${name} email: ${email} message:${message} phone: ${phone}.`,
    })
    await newMessage.save();

    res.status(201).json({ msg: 'Message sent successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
