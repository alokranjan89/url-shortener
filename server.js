const express = require("express");
require("dotenv").config();

const urlRoutes = require("./routes/urlRoutes");
const rateLimiter = require("./middleware/rateLimiter");

const app = express();

app.use(express.json());

app.use(rateLimiter);

app.use("/api/url", urlRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
