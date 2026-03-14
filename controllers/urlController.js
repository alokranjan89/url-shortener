const pool        = require("../config/db");
const redisClient = require("../config/redis");
const { nanoid }  = require("nanoid");
const { trackClick } = require("../services/analyticsService");

// ─────────────────────────────────────────────────────────
// POST /api/url/shorten
// ─────────────────────────────────────────────────────────
exports.createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !/^https?:\/\/.{3,}/.test(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const shortCode = nanoid(6);

    await pool.query(
      "INSERT INTO urls (original_url, short_code) VALUES ($1, $2)",
      [url, shortCode]
    );

    return res.json({
      shortUrl: `http://localhost:5000/api/url/${shortCode}`,
    });

  } catch (error) {
    console.error("[createShortUrl]", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/url/:code  →  redirect
// ─────────────────────────────────────────────────────────
exports.redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const cachedUrl = await redisClient.get(code);
    if (cachedUrl) {
      const result = await pool.query(
        "SELECT id FROM urls WHERE short_code=$1", [code]
      );
      if (result.rows.length > 0) {
        await trackClick(req, result.rows[0].id);
      }
      return res.redirect(cachedUrl);
    }

    const result = await pool.query(
      "SELECT * FROM urls WHERE short_code=$1", [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("URL not found");
    }

    const row = result.rows[0];

    await trackClick(req, row.id);
    await redisClient.setEx(code, 86400, row.original_url);

    return res.redirect(row.original_url);

  } catch (error) {
    console.error("[redirectUrl]", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/url/:code/preview
// ─────────────────────────────────────────────────────────
exports.previewUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const cacheKey = `preview_card:${code}`;
    const cached   = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const result = await pool.query(
      "SELECT * FROM urls WHERE short_code=$1", [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    const row = result.rows[0];
    const hostname = new URL(row.original_url).hostname;

    const preview = {
      domain:      hostname,
      title:       row.preview_title       || hostname,
      description: row.preview_description || "",
      favicon:     `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`,
      originalUrl: row.original_url,
      isSafe:      row.is_safe ?? true,
      shortUrl:    `http://localhost:5000/api/url/${code}`,
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(preview));

    return res.json(preview);

  } catch (error) {
    console.error("[previewUrl]", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
// GET /api/url/:code/stats
// ─────────────────────────────────────────────────────────
exports.getUrlStats = async (req, res) => {
  try {
    const { code } = req.params;

    const urlResult = await pool.query(
      "SELECT * FROM urls WHERE short_code=$1", [code]
    );
    if (urlResult.rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    const row = urlResult.rows[0];

    const [totalClicks, countryStats, deviceStats] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM clicks WHERE url_id=$1", [row.id]),
      pool.query(
        "SELECT country, COUNT(*) FROM clicks WHERE url_id=$1 GROUP BY country ORDER BY count DESC",
        [row.id]
      ),
      pool.query(
        "SELECT device, COUNT(*) FROM clicks WHERE url_id=$1 GROUP BY device ORDER BY count DESC",
        [row.id]
      ),
    ]);

    return res.json({
      shortCode:    code,
      originalUrl:  row.original_url,
      isSafe:       row.is_safe,
      createdAt:    row.created_at,
      totalClicks:  totalClicks.rows[0].count,
      countryStats: countryStats.rows,
      deviceStats:  deviceStats.rows,
    });

  } catch (error) {
    console.error("[getUrlStats]", error);
    res.status(500).json({ error: "Server error" });
  }
};