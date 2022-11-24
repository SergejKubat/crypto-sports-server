const express = require("express");

const ResetPasswordController = require("../controllers/reset-password.controller");

const router = express.Router();

router.post("/", ResetPasswordController.create);

router.get("/:id", ResetPasswordController.getById);

module.exports = router;
