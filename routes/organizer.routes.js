const express = require("express");

const auth = require("../middlewares/auth.middleware");

const OrganizerController = require("../controllers/organizer.controller");

const router = express.Router();

router.post("/", auth, OrganizerController.create);

router.put("/:id", auth, OrganizerController.update);

router.get("/:id", OrganizerController.getById);

router.get("/", OrganizerController.getAll);

module.exports = router;