const express = require("express");

const SearchController = require("../controllers/search.controller");

const router = express.Router();

router.get("/", SearchController.search);

module.exports = router;
