import React, { useState } from "react";
import "./App.css"; // keep this if you have animations or other CSS

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://127.0.0.1:5000";
const PUBLIC_TOKEN = (import.meta as any).env?.VITE_PUBLIC_TOKEN || "your_public_token";

const App: React.FC = () => {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) return alert("Please enter terms and conditions text.");

    setLoading(true);
    setError("");
    setFeedback("");
    setScore(null);

    try {
      const res = await fetch(`${BACKEND_URL}/analyze_terms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Token": PUBLIC_TOKEN,
        },
        body: JSON.stringify({ text }),
      });

      const ct = res.headers.get("content-type") || "";
      let data: any = {};

      if (ct.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = { error: `Invalid JSON response (status ${res.status})` };
        }
      } else {
        const textBody = await res.text();
        data = { error: `Unexpected response content-type (${ct})`, body: textBody };
      }

      if (res.ok) {
        setFeedback(data.feedback || "No feedback returned");
        setScore(data.score ?? null);
      } else {
        setError(data.error || `Request failed: ${res.status}`);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-gray-900/70 border border-gray-700 backdrop-blur-md rounded-2xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-2">
          ESECURE Terms Analyzer
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Analyze your Terms & Conditions for safety and transparency.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste terms & conditions here..."
          rows={8}
          className="w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`mt-4 w-full py-2 rounded-lg font-semibold transition-colors  ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {feedback && (
          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-inner">
            <h3 className="text-xl font-semibold text-blue-400 mb-2">
              Safety Score:{" "}
              <span className="text-green-400">{score ?? "N/A"}/100</span>
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">{feedback}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-900/40 border border-red-600 text-red-300 p-3 rounded-lg">
            <h3 className="font-semibold">Error:</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <footer className="mt-6 text-center text-gray-500 text-sm border-t border-gray-700 pt-3">
          Powered by <span className="text-blue-400 font-medium">ESECURE AI</span>
        </footer>
      </div>
    </div>
  );
};

export default App;
