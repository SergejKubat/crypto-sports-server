const express = require("express");

const auth = require("../middlewares/auth.middleware");

const EventController = require("../controllers/event.controller");

const router = express.Router();

router.post("/", auth, EventController.create);

router.put("/:id", auth, EventController.update);

router.delete("/:id", auth, EventController.delete);

router.get("/:id", EventController.getById);

router.get("/", EventController.getAll);

router.post("/:id/qr-codes", auth, EventController.addQRCodes);

module.exports = router;
