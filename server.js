import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

// 1. Check required environment variables before starting.
if (!process.env.HF_TOKEN) {
  console.error("HF_TOKEN is missing. Check your .env file.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;
const AI_TIMEOUT_MS = 45_000;

// 2. Configure CORS.
// Set FRONTEND_ORIGIN in .env when deploying.
// Multiple origins can be separated with commas.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as curl.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  }),
);

// Limit request body size to reduce unnecessary payloads.
app.use(express.json({ limit: "10kb" }));

const hf = new InferenceClient(process.env.HF_TOKEN);

// 3. Generate a recipe.
app.post("/recipe", async (req, res) => {
  const { ingredients } = req.body ?? {};

  // Validate the ingredients array.
  if (!Array.isArray(ingredients)) {
    return res.status(400).json({
      error: "Ingredients must be provided as an array.",
    });
  }

  if (ingredients.length === 0) {
    return res.status(400).json({
      error: "Please provide at least one ingredient.",
    });
  }

  if (ingredients.length > 20) {
    return res.status(400).json({
      error: "Please provide no more than 20 ingredients.",
    });
  }

  const validIngredients = ingredients.every(
    (ingredient) =>
      typeof ingredient === "string" &&
      ingredient.trim().length > 0 &&
      ingredient.trim().length <= 100,
  );

  if (!validIngredients) {
    return res.status(400).json({
      error:
        "Each ingredient must be a non-empty string of at most 100 characters.",
    });
  }

  // Normalize ingredient names.
  const cleanedIngredients = ingredients.map((ingredient) => ingredient.trim());

  console.log(
    `Recipe requested with ${cleanedIngredients.length} ingredients.`,
  );

  let timeoutId;

  try {
    // 4. Ask the AI model to generate the recipe.
    const aiRequest = hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content: `
You are Chef Claude, a helpful cooking assistant.

Given a list of ingredients, create a clear and easy-to-follow recipe.
You do not need to use every ingredient.
You may add a few common ingredients if necessary.

Always format your response using Markdown:

# Recipe Name

## Ingredients

- ingredient 1
- ingredient 2

## Instructions

1. First step.
2. Second step.

## Tips

- Helpful cooking tip.
- Another helpful tip.

Use headings, bullet points, and numbered lists.
Keep instructions clear and concise.
Do not put the entire recipe in one paragraph.
          `.trim(),
        },
        {
          role: "user",
          content: `I have ${cleanedIngredients.join(", ")}. Please give me a recipe I can make.`,
        },
      ],
      max_tokens: 1024,
    });

    // 5. Stop waiting if the AI request takes too long.
    // Promise.race times out our response wait, but does not cancel
    // the underlying Hugging Face request.
    const timeoutRequest = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error("AI request timed out.");
        error.code = "AI_TIMEOUT";
        reject(error);
      }, AI_TIMEOUT_MS);
    });

    const response = await Promise.race([aiRequest, timeoutRequest]);

    // 6. Verify the AI returned usable content.
    const recipe = response?.choices?.[0]?.message?.content;

    if (typeof recipe !== "string" || !recipe.trim()) {
      console.error("The AI service returned no usable recipe.");

      return res.status(502).json({
        error:
          "The recipe service returned an invalid response. Please try again.",
      });
    }

    console.log("Recipe generated successfully.");

    return res.status(200).json({
      recipe: recipe.trim(),
    });
  } catch (error) {
    // Keep detailed errors in the server logs, not the browser response.
    if (error?.code === "AI_TIMEOUT") {
      console.error("Recipe generation timed out.");

      return res.status(504).json({
        error: "Recipe generation took too long. Please try again.",
      });
    }

    console.error(
      "Recipe generation failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return res.status(502).json({
      error: "Unable to generate a recipe right now. Please try again shortly.",
    });
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
});

// 7. Handle unknown routes with a JSON response.
app.use((req, res) => {
  return res.status(404).json({
    error: "Route not found.",
  });
});

// 8. Handle malformed JSON and other Express errors.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body is too large.",
    });
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      error: "Request body must contain valid JSON.",
    });
  }

  console.error(
    "Server error:",
    error instanceof Error ? error.message : "Unknown error",
  );

  return res.status(500).json({
    error: "An unexpected server error occurred.",
  });
});

// 9. Start the backend.
app.listen(PORT, () => {
  console.log(`Chef Claude backend running at http://localhost:${PORT}`);
});
