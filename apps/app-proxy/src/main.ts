import express from "express";
import cors from "cors";
import { createProxyMiddleware as proxy } from "http-proxy-middleware";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(
  "/*",
  proxy({
    target: "https://movies.moum.it",
    changeOrigin: true,
  })
);

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
