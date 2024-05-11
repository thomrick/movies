import express from "express";
import cors from "cors";
import { createProxyMiddleware as proxy } from "http-proxy-middleware";
import https from "https";

const app = express();
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.post("/login", (req, res) => {
  const {
    body: { name },
  } = req;

  const formData = new FormData();
  formData.append("name", name);

  const params = new URLSearchParams();
  for (const [key, value] of formData) {
    params.append(key, value as string);
  }

  const options = {
    hostname: "movies.moum.it",
    port: 443,
    path: "/login",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": params.toString().length,
    },
  };

  const request = https.request(options, (response) => {
    response.pipe(res);
  });

  request.write(params.toString());

  request.end();
});

app.use(
  "/game",
  proxy({
    target: "https://movies.moum.it/game",
    changeOrigin: true,
    logger: console,
    secure: true,
    cookieDomainRewrite: {
      "localhost": "movies.moum.it",
    },
    on: {
      proxyRes: (proxyRes) => {
        proxyRes.headers["access-control-allow-origin"] = "http://localhost:5173";
      },
    }
  })
);

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
