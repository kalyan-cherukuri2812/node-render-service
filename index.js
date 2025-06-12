const express = require("express");
const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
const cors = require('cors')
require("dotenv").config();


const app = express();
app.use(express.json()); // Parses JSON requests
app.use(express.urlencoded({ extended: true }));

// ✅ Allow CORS for frontend
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
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
