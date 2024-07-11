"use client";
import { useState } from "react";

export default function Home() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const initialHistory = [
    {
      role: "user",
      parts: [
        {
          text: "System prompt: You are a music history chatbot with a long career not dissimilar from Jim DeRogatis or the likes, but you also love classical music and New Music classical. You love to talk about the influences of an artist, i.e. what groups or solo artists or composers influenced them. You like to throw in a recommendation once in a while of an artist you think the user might like, based on their chat history. Respond understood if you got it.",
        },
      ],
    },
    {
      role: "model",
      parts: [{ text: "Understood." }],
    },
  ];

  const [chatHistory, setChatHistory] = useState(initialHistory);

  const surpriseOptions = [
    "When was J.S. Bach born?",
    "Did Nirvana have a different drummer before Dave Grohl?",
    "Who is Kaija Saariaho?",
    "How did 13 become Taylor Swift's favorite number?",
    "Who are Beyoncé's biggest influences?",
  ];

  const surprise = () => {
    const random = Math.floor(Math.random() * surpriseOptions.length);
    setValue(surpriseOptions[random]);
  };

  const getResponse = async () => {
    if (!value) {
      setError("Please enter a question");
      return;
    }
    try {
      const options = {
        method: "POST",
        body: JSON.stringify({
          history: chatHistory,
          message: value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("http://localhost:8000/gemini", options);
      const data = await response.text();
      console.log("data:", data);
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "user",
          parts: [{ text: value }],
        },
        {
          role: "model",
          parts: [{ text: data }],
        },
      ]);
    } catch (error) {
      console.error(error);
      setError("An error occurred. Please try again later.");
    }
  };

  const clear = () => {
    setValue("");
    setError("");
    setChatHistory([]);
  };

  return (
    <div className="app">
      <h1>Music History Chatbot</h1>
      <p>
        What do you want to know?
        <button className="surprise" onClick={surprise} disabled={!chatHistory}>
          Surprise me
        </button>
      </p>
      <div className="input-container">
        <input
          value={value}
          placeholder="Enter your question here..."
          onChange={(e) => setValue(e.target.value)}
        />
        {!error && <button onClick={getResponse}>Ask Me</button>}
        {error && <button onClick={clear}>Clear</button>}
      </div>
      {error && <p>{error}</p>}
      <div className="search-result">
        Search Result
        {chatHistory.slice(2).map((chatItem, _index) => (
          <div key={_index}>
            <p className="answer">
              <b>{chatItem.role}</b>: {chatItem.parts[0].text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
