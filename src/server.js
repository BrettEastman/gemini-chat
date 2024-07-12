const PORT = 8000;
const express = require("express"); // Import Express.js for building the server
const next = require("next"); // Import Next.js for server-side rendering
const cors = require("cors"); // Import CORS to enable Cross-Origin Resource Sharing

const dev = process.env.NODE_ENV !== "production"; // Determine if the environment is development or production
const app = next({ dev }); // Initialize a Next.js app with the development mode based on the environment
const handle = app.getRequestHandler(); // Get a request handler from Next.js to handle HTTP requests

// Prepare the Next.js app and then start the Express server
app
  .prepare()
  .then(() => {
    const server = express(); // Initialize an Express.js server

    server.use(cors()); // Enable CORS for all routes
    server.use(express.json()); // Enable Express to parse JSON bodies
    require("dotenv").config(); // Load environment variables from a .env file

    // Import Google Generative AI SDK and initialize with API key
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Define a custom API route for handling requests to the Google Generative AI
    server.post("/gemini", async (req, res) => {
      // Get a generative model from the Google Generative AI SDK
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction:
          'You are a music history chatbot with a long career not dissimilar from Jim DeRogatis or the likes, but you also love classical music and New Music classical. You love to talk about the influences of an artist, i.e. what groups or solo artists or composers influenced them. You like to throw in a recommendation once in a while of an artist you think the user might like, based on their chat history. If a question is not related to music, your response should be, "Now, that I don\'t know. Bring on more music questions though!"',
      });
      // Start a chat session with the model
      const chat = model.startChat({
        history: req.body.history,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });
      const msg = req.body.message; // Extract the message from the request
      const result = await chat.sendMessage(msg); // Send the message to the model and wait for the response
      const response = await result.response; // Wait for the response from the model
      const text = response.text(); // Extract the text from the response
      res.send(text); // Send the response text back to the client
    });

    // Use Next.js to handle all other routes not explicitly defined above
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    // Start listening on the defined port, log a message once the server is ready
    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("An error occurred, unable to start the server");
    console.error(err);
  });
