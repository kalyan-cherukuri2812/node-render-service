const express = require("express");
const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
const cors = require('cors')
require("dotenv").config();


const app = express();
app.use(express.json()); // Parses JSON requests
app.use(express.urlencoded({ extended: true }));

// ✅ Allow CORS for frontend
app.use(cors({ origin: "http://localhost:5174", credentials: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});


const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL// Make sure this is correct!
console.log(BACKEND_URL)


app.use(
  "/api",
  (req, res, next) => {
    next();
  },
  legacyCreateProxyMiddleware({
    target: BACKEND_URL, 
    changeOrigin: true,
    secure: false,
    pathRewrite: { "^/api": "" }, 
    onProxyReq: (proxyReq, req, res) => {
      if (req.body && req.method !== "GET") {
        let bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        // proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
    },
    onError: (err, req, res) => {
      console.error(`❌ Proxy Error: ${err.message}`);
    },
  })
);

app.listen(PORT, async() => {
  console.log(`✅ Proxy server running on port ${PORT}`);
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
