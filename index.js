

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

Generate a set of monthly performance studies specifically tailored for a business in the "${sector}" sector.

Each study should include:
- A metric name
- A short description
- A scaling method that allows comparison across small and large businesses

⚠️ IMPORTANT: Format each study as a mobile-friendly HTML card using this exact structure:

<div style="border: 1px solid #ccc; border-radius: 10px; padding: 16px; background-color: #111; width: 100%; max-width: 500px; font-family: sans-serif;">
  <h3 style="color: white; font-size: 18px; margin-bottom: 10px;">[Metric Name]</h3>
  <p style="color: grey; margin: 6px 0;"><strong>Description:</strong> [Short Description]</p>
  <p style="color: grey; margin: 6px 0;"><strong>Scaling Method:</strong> [Scaling explanation]</p>
</div>

Return 6–8 different cards, stacked one after another. Do not include any headings, intros, explanations, or notes.
  `;

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs benchmarking studies as styled HTML cards.",
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
