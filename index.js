const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { OpenAI } = require("openai");
const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {
  const sector = (req.body.sector || "professional services").trim();

  const prompt = `
You are an expert in business benchmarking and performance analysis.

Generate a set of monthly performance studies tailored specifically for a business in the "${sector}" sector.

Each study should include:
- A **Metric Name**
- A **Short Description**
- A **Scaling Method** that allows firms of all sizes (small and large) to compare fairly.

Format your response as a clean HTML block, suitable for display as mobile-friendly cards (stacked vertically). Use white headers, grey text, and subtle spacing.

Avoid any summary or intro — just output the styled study cards.
  `;

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates sector-specific performance study cards in HTML.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
    });

    const reply = chatResponse.choices[0].message.content;
    res.send(reply);
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).send(`
      <div style="color: white; font-family: sans-serif;">
        <h2>Something went wrong</h2>
        <p style="color: grey;">Our content generator is temporarily unavailable. Please try again later.</p>
      </div>
    `);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

