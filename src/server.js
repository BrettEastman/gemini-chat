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
    server.post("/api/google-generative-ai", async (req, res) => {
      const { prompt } = req.body;

      try {
        const response = await genAI.generateText({ prompt });
        res.json(response);
      } catch (error) {
        console.error("Error generating text:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
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
