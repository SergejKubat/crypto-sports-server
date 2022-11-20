const express = require("express");

const EventController = require("../controllers/EventController");

const router = express.Router();

router.post("/", EventController.create);

router.put("/:id", EventController.update);

router.get("/:id", EventController.getById);

module.exports = router;
