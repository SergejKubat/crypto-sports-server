const express = require("express");

const auth = require("../middlewares/auth.middleware");

const UserController = require("../controllers/user.controller");

const router = express.Router();

router.get("/", auth, UserController.getAll);

router.get("/generateNonce", auth, UserController.generateNonce);

router.put("/linkWallet", auth, UserController.linkWallet);

router.put("/unlinkWallet", auth, UserController.unlinkWallet);

router.delete("/", auth, UserController.delete);

module.exports = router;
