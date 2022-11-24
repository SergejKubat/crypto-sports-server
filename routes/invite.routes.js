const express = require("express");

const auth = require("../middlewares/auth.middleware");

const InviteController = require("../controllers/invite.controller");

const router = express.Router();

router.post("/", auth, InviteController.create);

router.delete("/:code", auth, InviteController.delete);

router.get("/:code", InviteController.getById);

router.get("/", InviteController.getAll);

module.exports = router;
