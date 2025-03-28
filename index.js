const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {
  const sector = req.body.sector;

  const prompt = `
Generate 8 performance metrics for a ${sector} business. 
Each metric should include:
- a short title
- a 1-line description
- a calculation

Format the result in dark-themed HTML card format like this:
<div style="background-color:#1a1a1a; border:1px solid #666; padding:16px; width:300px; box-sizing:border-box; font-family:Arial;">
  <h3 style="color:#fff; margin:0 0 8px 0;">Metric Name</h3>
  <p><span style="color:#fff;"><strong>Description:</strong></span> <span style="color:#ccc;">One-line description</span></p>
  <p><span style="color:#fff;"><strong>Calculation:</strong></span> <span style="color:#ccc;">Formula here</span></p>
</div>
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message.content;
    res.send(reply);
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).send("Something went wrong");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
