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

  try {
    const insightPrompt = `
You're an expert market strategist writing for a performance benchmarking app called Peerformance.

Write 2 short and original sentences that:
- Are directly relevant to the sector: "${sector}"
- Mention typical sub-categories in that industry Peerformance can benchmark
- Mention that users can filter by region to make peer groups more relevant
- Finish with a natural line like: "Here are some useful studies to consider."

Be specific, original, and vary tone and phrasing — avoid repeating sentence structure across uses.

Only return a single version of the insight. Do not return multiple variations or repeats.
`;

    const insightResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: insightPrompt }],
      temperature: 0.8,
    });

    const insightText = insightResponse.choices[0].message.content;

    const metricPrompt = `
Generate 6–8 benchmarking studies tailored to the "${sector}" sector.

The FIRST study must be the most important and widely tracked metric for the sector — something the majority of businesses in this field already monitor (e.g. revenue per client, billable hours, retention rate, etc). It should be clearly sector-relevant.

Each study should include:
- A metric name
- A short description
- A clear calculation formula

Format each study using this exact HTML structure:

<div style="border: 1px solid #ccc; border-radius: 10px; padding: 16px; background-color: #111; width: 100%; max-width: 500px; font-family: sans-serif;">
  <h3 style="color: white; font-size: 18px; margin-bottom: 10px;">[Metric Name]</h3>
  <p style="color: grey; margin: 6px 0;"><span style="color: white; font-weight: normal;">Description:</span> [Brief explanation]</p>
  <p style="color: grey; margin: 6px 0;"><span style="color: white; font-weight: normal;">Calculation:</span> [Formula]</p>
</div>

Only return the list of HTML blocks. No intro, headings or notes.
`;

    const metricResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: metricPrompt }],
      temperature: 0.6,
    });

    const metricCards = metricResponse.choices[0].message.content;

    res.json({
      insight: insightText,
      html: metricCards,
    });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({
      insight: "We couldn't generate an insight at the moment.",
      html: `<p style="color: red;">Something went wrong while generating studies. Please try again later.</p>`
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});




