const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  try {
    return jwt.sign({ _id: user._id }, String(process.env.JWT_SECRET), {
      expiresIn: "2h",
    });
  } catch (err) {
    throw err;
  }
};

const generateRefreshToken = (user) => {
  try {
    return jwt.sign({ _id: user._id }, String(process.env.REFRESH_TOKEN_SECRET), {
      expiresIn: "7d",
    }
    );
  } catch (err) {
    throw err;
  }
};

module.exports = { generateToken, generateRefreshToken };