const express = require("express");
const router = express.Router();

const {
  createShortUrl,
  redirectUrl,
  getUrlStats
} = require("../controllers/urlController");

router.post("/shorten", createShortUrl);

// IMPORTANT: stats route BEFORE redirect route
router.get("/:code/stats", getUrlStats);

router.get("/:code", redirectUrl);

module.exports = router;