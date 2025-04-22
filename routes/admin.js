const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");

//🔹GET ALL USERS
router.get("/users", adminController.getAllUsers);

module.exports = router;