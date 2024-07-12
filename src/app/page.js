"use client";
import { useState } from "react";

export default function Home() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const [chatHistory, setChatHistory] = useState([]);

  const surpriseOptions = [
    "When was J.S. Bach born?",
    "Did Nirvana have a different drummer before Dave Grohl?",
    "Who is Kaija Saariaho?",
    "How did 13 become Taylor Swift's favorite number?",
    "Who are Beyoncé's biggest influences?",
    "Why do all the Motown groups have 'The' in their names?",
    "What is the difference between a symphony and a concerto?",
    "Did Beethoven really write his 9th Symphony while deaf?",
    "Did Franz Liszt really play 19th-century rock concerts?",
    "What kind of guitar did Jimi Hendrix play?",
    "How old was Mozart when he wrote his first symphony?",
    "Who is the most sampled artist in hip-hop?",
    "What is Billie Eilish's favorite song?",
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
        {!error && <button onClick={getResponse}>Ask</button>}
        {error && <button onClick={clear}>Clear</button>}
      </div>
      {error && <p>{error}</p>}
      <div className="search-result">
        <h4>Search Result</h4>
        {chatHistory.map((chatItem, _index) => (
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
