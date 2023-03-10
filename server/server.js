require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const { Configuration, OpenAIApi } = require("openai");
const rateLimit = require("express-rate-limit");

const apiRequestLimiter = rateLimit({
   windowMs: 24 * 60 * 60 * 1000,
   max: 25,
});

app.use(cors());
app.use(express.json());
app.use(apiRequestLimiter);

const configuration = new Configuration({
   apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/ask", async (req, res) => {
   const { message } = req.body;
   try {
      const completion = await openai.createChatCompletion({
         model: "gpt-3.5-turbo",
         temperature: 0.6,
         messages: [{ role: "user", content: message }],
      });

      const text = completion.data.choices[0].message.content.trim();
      res.json(text);
   } catch (error) {
      console.log(error);
   }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Server running on port ${port}`);
});
