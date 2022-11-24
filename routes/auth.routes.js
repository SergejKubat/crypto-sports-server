const express = require("express");

const auth = require("../middlewares/auth.middleware");

const AuthController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/reset-password", AuthController.resetPassword);

router.get("/logout", auth, AuthController.logout);

router.get("/auth", auth, AuthController.auth);

module.exports = router;
