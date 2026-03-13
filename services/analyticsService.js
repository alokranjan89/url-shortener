const pool = require("../config/db");
const geoip = require("geoip-lite");
const useragent = require("useragent");

exports.trackClick = async (req, urlId) => {
  console.log("Tracking click for URL:", urlId);
  try {
    const agent = useragent.parse(req.headers["user-agent"]);
    const device = agent.device.toString() || "unknown";

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      req.ip;

    const geo = geoip.lookup(ip);
    const country = geo?.country || "Unknown";

    await pool.query(
      "INSERT INTO clicks (url_id, device, country) VALUES ($1,$2,$3)",
      [urlId, device, country]
    );
  } catch (err) {
    console.error("Analytics error:", err);
  }
};