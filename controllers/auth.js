const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { generateToken, generateRefreshToken } = require("../utils/jwt");

// Resend verification email

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    next(err);
  }
};

// exports.postRequestVerifyEmail = async (req, res, next) => {
//     const { email } = req.body;

//     if (!email) {
//         const error = new Error("Email is required");
//         error.statusCode = 400;
//         throw error;
//     }

//     try {
//         const user = await User.findOne({ email: email });

//         if (!user) {
//             const error = new Error("User not found");
//             error.statusCode = 404;
//             throw error;
//         }

//         // Send email to user

//         res.status(200).json({ message: "Email sent" });
//     } catch (err) {
//         next(err);
//     }
// }

// exports.postVerifyEmail = async (req, res, next) => {

// }

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error("Incorrect password");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isVerified) {
      // Resend verification email
      const error = new Error(
        "Email not verified, please check your email for verification link"
      );
      error.statusCode = 401;
      throw error;
    }

    const payload = { _id: user._id.toString() };
    const token = await generateToken(payload);
    const refreshToken = await generateRefreshToken(payload);
    user.refreshToken = refreshToken;

    res.status(200).json({ message: "Login successful", token, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.postRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      const error = new Error("Refresh token not provided");
      error.statusCode = 401;
      throw error;
    }

    const payload = await jwt.verify(
      refreshToken,
      String(process.env.REFRESH_TOKEN_SECRET)
    );

    if (!payload) {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    const newToken = await jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(200).json({ token: newToken });
  } catch (err) {
    next(err);
  }
};

exports.putUpdatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmedPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      const error = new Error("Incorrect password");
      error.statusCode = 401;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated sucessfully" });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = "";
    await user.save();

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

// Helper functions
function createHtmlResponse(title, message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || "Error"}</title>
      <style>
        body {
          background-color: #000;
          color: #fff;
          font-family: 'Arial', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          max-width: 600px;
          padding: 20px;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        }
        h1 {
          font-size: 2em;
          margin-bottom: 15px;
        }
        p {
          font-size: 1.2em;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
    `;
}
