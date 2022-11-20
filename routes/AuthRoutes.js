const express = require("express");

const AuthController = require("../controllers/AuthController");

const router = express.Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.get("/logout", AuthController.logout);

router.get("/auth", AuthController.auth);

module.exports = router;
