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

// // ✅ Middleware to parse JSON and URL-encoded bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ CORS Configuration
// const corsOptions = {
//   origin: ["http://localhost:5173", "https://your-frontend-on-render.com"], // add deployed frontend URL
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// };
// app.use(cors(corsOptions));

// // ✅ Optional: Override referrer policy if needed
// app.use((req, res, next) => {
//   res.setHeader("Referrer-Policy", "no-referrer"); // or "origin-when-cross-origin"
//   next();
// });

// // ✅ Get values from env
// const PORT = process.env.PORT || 5000;
// const BACKEND_URL = process.env.BACKEND_URL;

// if (!BACKEND_URL) {
//   console.error("❌ BACKEND_URL is not defined. Check your .env or Render settings.");
//   process.exit(1);
// }

// console.log("🔗 Proxy target:", BACKEND_URL);

// // ✅ Proxy middleware
// app.use(
//   "/api",
//   legacyCreateProxyMiddleware({
//     target: BACKEND_URL,
//     changeOrigin: true,
//     secure: false,
//     pathRewrite: { "^/api": "" },
//     onProxyReq: (proxyReq, req) => {
//       if (req.body && req.method !== "GET") {
//         const bodyData = JSON.stringify(req.body);
//         proxyReq.setHeader("Content-Type", "application/json");
//         proxyReq.write(bodyData);
//       }

//       // Forward Authorization header if present
//       if (req.headers.authorization) {
//         proxyReq.setHeader("Authorization", req.headers.authorization);
//       }
//     },
//     onError: (err, req, res) => {
//       console.error(`❌ Proxy Error: ${err.message}`);
//       res.status(500).json({ error: "Proxy Error", detail: err.message });
//     }
//   })
// );

// // ✅ Start the server
// app.listen(PORT, () => {
//   console.log(`✅ Proxy server running on port ${PORT}`);
// });
