const express = require("express");
const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS setup
app.use(
  cors({
    origin: "https://unitask-6d75c.web.app",
    credentials: true,
  })
);

// ✅ Additional headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL;

console.log(`✅ BACKEND_URL: ${BACKEND_URL}`);

app.use(
  "/api",
  legacyCreateProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    secure: false,
    pathRewrite: { "^/api": "" },

    onProxyReq: (proxyReq, req) => {
      console.log(`➡️  [${req.method}] ${req.originalUrl}`);

      if (req.body && req.method !== "GET") {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.write(bodyData);
        console.log("📦 Body:", req.body);
      }
    },

    onProxyRes: (proxyRes, req) => {
      console.log(`✅ [${req.method}] ${req.originalUrl} - ${proxyRes.statusCode}`);
    },

    onError: (err, req, res) => {
      console.error(`❌ Proxy error on ${req.method} ${req.originalUrl}`);
      console.error("   Error message:", err.message);

      // Respond to client and stop further execution
      res.status(500).json({
        success: false,
        message: "Proxy error. Failed to reach backend service.",
        error: err.message,
      });

      // Optional: terminate process for fatal errors (e.g., backend unreachable)
      // if (err.code === 'ECONNREFUSED') {
      //   process.exit(1);
      // }
    },
  })
);

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});



// const express = require("express");
// const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(cors({
//   origin: ["http://localhost:5174", "https://bhim-admin-portal.web.app"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// app.use("/api", (req, res, next) => {
//   console.log(`› Proxying ${req.method} ${req.originalUrl}`);
//   next();
// });

// app.use((req, res, next) => {
//   res.setHeader("Referrer-Policy", "no-referrer");
//   next();
// });

// const PORT = process.env.PORT || 5000;
// const BACKEND_URL = process.env.BACKEND_URL;
// if (!BACKEND_URL) {
//   console.error("❌ BACKEND_URL is missing. Set it in .env or Render env vars.");
//   process.exit(1);
// }
// console.log("🔗 Proxy target:", BACKEND_URL);

// app.use("/api", legacyCreateProxyMiddleware({
//   target: BACKEND_URL,
//   changeOrigin: true,
//   secure: false,
//   pathRewrite: { "^/api": "" },
//   onProxyReq: (proxyReq, req) => {
//     if (req.body && req.method !== "GET") {
//       const body = JSON.stringify(req.body);
//       proxyReq.setHeader("Content-Type", "application/json");
//       proxyReq.write(body);
//     }
//     if (req.headers.authorization) {
//       proxyReq.setHeader("Authorization", req.headers.authorization);
//     }
//   },
//   onError: (err, req, res) => {
//     console.error("Proxy Error:", err.message);
//     if (!res.headersSent) {
//       res.status(500).json({ error: "Proxy failed", detail: err.message });
//     }
//   }
// }));


// app.listen(PORT, () => {
//   console.log(`✅ Proxy server is running on port ${PORT}`);
// });
