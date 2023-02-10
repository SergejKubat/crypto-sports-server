const express = require("express");

const auth = require("../middlewares/auth.middleware");

const TicketController = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/", auth, TicketController.getPurchasedTickets);

router.get("/events/:id", auth, TicketController.getEventTickets);

router.post("/:id/getQRCode", auth, TicketController.getQRCode);

router.put("/:id", auth, TicketController.update);

module.exports = router;
