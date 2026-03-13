const express = require("express");
const router = express.Router();

const {
  createShortUrl,
  redirectUrl,
  getUrlStats
} = require("../controllers/urlController");

router.post("/shorten", createShortUrl);

router.get("/:code/stats", getUrlStats);

router.get("/:code", redirectUrl);

module.exports = router;
