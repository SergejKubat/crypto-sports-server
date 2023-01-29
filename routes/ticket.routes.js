const express = require("express");

const auth = require("../middlewares/auth.middleware");

const TicketController = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/", auth, TicketController.getPurchasedTickets);

router.post("/:id/getQRCode", auth, TicketController.getQRCode);

router.put("/:id", auth, TicketController.update);

module.exports = router;
