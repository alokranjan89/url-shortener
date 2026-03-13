🔗 URL Shortener with Analytics

A production-style URL shortening service built with **Node.js, Express, PostgreSQL, and Redis**.
The system generates short URLs, handles high-speed redirects with Redis caching, and tracks detailed click analytics.

---

## 🚀 Features

* Shorten long URLs into compact shareable links
* High-performance redirects using **Redis caching**
* Click analytics tracking:

  * Total clicks
  * Device type
  * Country
* Rate limiting to prevent abuse
* PostgreSQL for persistent storage
* Docker support for easy deployment
* REST API architecture

---

## 🏗️ Architecture

Client → Express API → Redis Cache → PostgreSQL Database → Analytics Service

```
User
 ↓
API Server (Express)
 ↓
Redis Cache (fast redirects)
 ↓
PostgreSQL (persistent storage)
 ↓
Analytics Tracking
```

---

## 📂 Project Structure

```
url-shortener
│
├── config
│   ├── db.js
│   └── redis.js
│
├── controllers
│   └── urlController.js
│
├── routes
│   └── urlRoutes.js
│
├── middleware
│   └── rateLimiter.js
│
├── services
│   └── analyticsService.js
│
├── server.js
├── docker-compose.yml
├── package.json
└── .env
```

---

## ⚙️ Installation

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/url-shortener-analytics.git
cd url-shortener-analytics
```

Install dependencies:

```
npm install
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/urlshortener

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## ▶️ Running the Server

Start the backend:

```
npm start
```

Server runs at:

```
http://localhost:5000
```

---

## 📡 API Endpoints

### Create Short URL

```
POST /api/url/shorten
```

Request body:

```
{
 "url": "https://google.com"
}
```

Response:

```
{
 "shortUrl": "http://localhost:5000/api/url/abc123"
}
```

---

### Redirect to Original URL

```
GET /api/url/:code
```

Example:

```
http://localhost:5000/api/url/abc123
```

---

### URL Analytics

```
GET /api/url/:code/stats
```

Example response:

```
{
 "totalClicks": "6",
 "countryStats": [
   { "country": "IN", "count": "6" }
 ],
 "deviceStats": [
   { "device": "desktop", "count": "6" }
 ]
}
```

---

## 🐳 Docker Setup

Run Redis using Docker:

```
docker compose up -d
```

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Redis**
* **Docker**
* **NanoID**
---

## 👨‍💻 Author

**Alok Ranjan**
