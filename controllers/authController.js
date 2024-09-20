// controllers/authController.js
const User = require('../models/user');
const Address = require('../models/address'); // Import the Address model
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Otp = require('../models/otp');  
const otpStore = {};

exports.register = async (req, res) => {
  const { name, email, password, role, shopName, addresses } = req.body;

  try {

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

  
    user = new User({
      name,
      email,
      password, 
      role,
      shopName,
    });

    // Save the user
    await user.save();

    // Add addresses if provided
    if (addresses && addresses.length > 0) {
      const addressPromises = addresses.map(async (address) => {
        const newAddress = new Address({
          ...address,
          user: user._id, // Link address to user
        });
        const savedAddress = await newAddress.save();
        return savedAddress._id; // Return the ObjectId of the saved address
      });

      const addressIds = await Promise.all(addressPromises);
      user.addresses = addressIds; // Store the array of ObjectIds in user
      await user.save();
    }

    // Generate a JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6h' }, (err, token) => {
      if (err) throw err;
      // Return user details and token
      res.json({ user, token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare entered password with stored password directly (both should be hashed)
    if (password !== user.password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Prepare the payload with user details
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // Generate a JWT token with 6 hours expiry
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6h' }, (err, token) => {
      if (err) throw err;

      // Send token along with user info
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


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


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate a unique OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    const expiresAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

    // Save OTP to the database
    const otpInstance = new Otp({
      email,
      otp,
      expiresAt,
    });
    await otpInstance.save();

    // Send OTP via email
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It will expire in 15 minutes.`,
    });

    res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// controllers/authController.js
exports.verifyOtpAndChangePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find OTP record
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // Check if OTP has expired
    if (Date.now() > otpRecord.expiresAt) {
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    // Optionally, delete the OTP record after successful use
    await Otp.deleteOne({ email, otp });

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// exports.sendOtp = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: 'User with this email does not exist' });
//     }

//     const otp = crypto.randomInt(100000, 999999).toString();

  
//     otpStore[email] = otp;

//     const mailOptions = {
//       from: "devdoodleslearner@gmail.com",
//       to: email,
//       subject: 'Password Reset OTP',
//       text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return res.status(500).json({ msg: 'Failed to send email', error });
//       }
//       res.status(200).json({ msg: 'OTP sent to your email' });
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: 'Server error' });
//   }
// };

// // Step 2: Verify OTP and change password
// exports.verifyOtpAndChangePassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   try {
//     // Check if OTP is valid
//     if (!otpStore[email] || otpStore[email] !== otp) {
//       return res.status(400).json({ msg: 'Invalid or expired OTP' });
//     }

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // Update the password (without hashing as per request)
//     user.password = newPassword;
//     await user.save();

//     // Clear OTP after successful password reset
//     delete otpStore[email];

//     res.status(200).json({ msg: 'Password changed successfully' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: 'Server error' });
//   }
// };
