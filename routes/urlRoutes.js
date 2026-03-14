const express = require("express");
const router  = express.Router();

const {
  createShortUrl,
  redirectUrl,
  getUrlStats,
  previewUrl,
} = require("../controllers/urlController");

router.post("/shorten",      createShortUrl);
router.get("/:code/preview", previewUrl);
router.get("/:code/stats",   getUrlStats);
router.get("/:code",         redirectUrl);

module.exports = router;