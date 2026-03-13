const pool = require("../config/db");
const redisClient = require("../config/redis");
const { nanoid } = require("nanoid");
const { trackClick } = require("../services/analyticsService");

exports.createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    const shortCode = nanoid(6);

    await pool.query(
      "INSERT INTO urls (original_url, short_code) VALUES ($1,$2)",
      [url, shortCode]
    );

    res.json({
      shortUrl: `http://localhost:5000/api/url/${shortCode}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const cachedUrl = await redisClient.get(code);

    if (cachedUrl) {
      // get url id for analytics
      const result = await pool.query(
        "SELECT id FROM urls WHERE short_code=$1",
        [code]
      );

      if (result.rows.length > 0) {
        await trackClick(req, result.rows[0].id);
      }

      return res.redirect(cachedUrl);
    }

    const result = await pool.query(
      "SELECT * FROM urls WHERE short_code=$1",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("URL not found");
    }

    const url = result.rows[0];

    // track analytics
    await trackClick(req, url.id);

    // cache the URL
    await redisClient.set(code, url.original_url);

    res.redirect(url.original_url);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getUrlStats = async (req, res) => {
  try {
    const { code } = req.params;

    const urlResult = await pool.query(
      "SELECT id FROM urls WHERE short_code=$1",
      [code]
    );

    if (urlResult.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    const urlId = urlResult.rows[0].id;

    const totalClicks = await pool.query(
      "SELECT COUNT(*) FROM clicks WHERE url_id=$1",
      [urlId]
    );

    const countryStats = await pool.query(
      "SELECT country, COUNT(*) FROM clicks WHERE url_id=$1 GROUP BY country",
      [urlId]
    );

    const deviceStats = await pool.query(
      "SELECT device, COUNT(*) FROM clicks WHERE url_id=$1 GROUP BY device",
      [urlId]
    );

    res.json({
      totalClicks: totalClicks.rows[0].count,
      countryStats: countryStats.rows,
      deviceStats: deviceStats.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};