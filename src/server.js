// server.js
const PORT = 8000;
const express = require("express");
const next = require("next");
const cors = require("cors");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(cors());
    server.use(express.json());
    require("dotenv").config();

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Custom API route using Google Generative AI
    server.post("/gemini", async (req, res) => {
      console.log("req.body.history:", req.body.history);
      console.log("req.body.message:", req.body.message);

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: req.body.history,
      });
      const msg = req.body.message;
      const result = await chat.sendMessage(msg);
      const response = await result.response;
      const text = response.text();
      res.send(text);
    });

    // Handle all other routes with Next.js
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("An error occurred, unable to start the server");
    console.error(err);
  });
