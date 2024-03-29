const path = require("path");

const express = require("express");
const multer = require("multer");

const auth = require("../middlewares/auth.middleware");

const FileController = require("../controllers/file.controller");

const constants = require("../constants");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage, limits: { fileSize: constants.TWO_MEGABYTES } });

const router = express.Router();

router.post("/upload", auth, upload.single("file"), FileController.upload);

module.exports = router;
