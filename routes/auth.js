const express = require("express");
const passport = require("passport");
const { body } = require("express-validator");

const authController = require("../controllers/auth");
const user = require("../models/user");
const authenticateJwt = require("../middleware/auth");
const validateRequest = require("../middleware/validation");

const router = express.Router();

//🔹POST /register
router.post(
  "/register",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      .withMessage("Password must contain both letters and numbers"),
    body("confirmedPassword")
      .notEmpty()
      .withMessage("Confirmed password is required")
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  validateRequest,
  authController.postSignup
);

//🔹POST /requestVerifyEmail (Needs email)
// router.use("/requestVerifyEmail", authController.postRequestVerifyEmail);

//🔹POST /verifyEmail
// router.use("/verifyEmail", authController.postVerifyEmail);

//🔹POST /login
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .bail()
      .isEmail()
      .withMessage("Invalid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  authController.postLogin
);

//🔹POST /refreshToken
router.post("/refreshToken", authController.postRefreshToken);

//🔹PUT /changePassword
router.put(
  "/updatePassword",
  authenticateJwt,
  [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      .withMessage("Password must contain both letters and numbers"),
    body("confirmedPassword")
      .notEmpty()
      .withMessage("Confirmed password is required")
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  validateRequest,
  authController.putUpdatePassword
);

//🔹POST /requestPasswordReset (Needs email)

//🔹POST /resetPassword

//🔹GET /me
router.get("/me", authenticateJwt, authController.getMe);

//🔹GET /logout
router.post("/logout", authenticateJwt, authController.postLogout);

module.exports = router;
