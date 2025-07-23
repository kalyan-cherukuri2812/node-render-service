const express = require("express");
const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) return next();
  express.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) return next();
  express.urlencoded({ extended: true })(req, res, next);
});

// ✅ CORS setup
const allowedOrigins = [
  "https://unitask-6d75c.web.app",
  "http://localhost:5174"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
// app.use(
//   cors({
//     origin: "https://unitask-6d75c.web.app",
//     credentials: true,
//   })
// );

// ✅ Additional headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // or specific origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No Content
  }

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

    // onProxyReq: (proxyReq, req) => {
    //   req.pipe(proxyReq);
// },

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
