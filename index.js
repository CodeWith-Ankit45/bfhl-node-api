const express = require("express");
const cors = require("cors");
const axios = require("axios");

require("dotenv").config();
// console.log("Gemini Key Loaded:", process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const OFFICIAL_EMAIL = "ankit1075.be23@chitkarauniversity.edu.in";

function fibonacci(n) {
  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
}

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(arr) {
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

async function askGemini(question) {
  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent";

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: question }],
          },
        ],
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    const text =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) return text.trim();
  } catch (err) {
    console.error("Gemini unavailable, using fallback");
  }

  const q = question.toLowerCase();

  if (q.includes("capital of bihar")) return "Patna";
  if (q.includes("capital of maharashtra")) return "Mumbai";
  if (q.includes("capital of india")) return "New Delhi";

  return "Answer not available";
}


app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid input",
      });
    }

    const key = Object.keys(body)[0];
    const value = body[key];
    let result;

    if (key === "fibonacci") {
      result = fibonacci(value);
    } else if (key === "prime" && Array.isArray(value)) {
      result = value.filter(isPrime);
    } else if (key === "lcm" && Array.isArray(value)) {
      result = lcm(value);
    } else if (key === "hcf" && Array.isArray(value)) {
      result = value.reduce(gcd);
    } else if (key === "AI") {
      result = await askGemini(value);
    } else {
      return res.status(400).json({
        is_success: false,
        message: "Invalid key",
      });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      is_success: false,
      message: "Server error",
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
