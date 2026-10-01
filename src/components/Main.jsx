import React from "react";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";
import { getRecipeFromMistral } from "../ai";

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [ingredientError, setIngredientError] = React.useState("");
  const [recipeError, setRecipeError] = React.useState("");

  async function getRecipe() {
    if (loading) return;

    setLoading(true);
    setRecipeError("");
    setRecipe("");

    try {
      const recipeMarkdown = await getRecipeFromMistral(ingredients);
      setRecipe(recipeMarkdown);
    } catch (error) {
      console.error("Recipe generation failed:", error);
      setRecipeError(
        "Sorry, we couldn't generate your recipe. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function addIngredient(formData) {
    const ingredientValue = formData.get("ingredient");
    const newIngredient =
      typeof ingredientValue === "string" ? ingredientValue.trim() : "";

    if (!newIngredient) {
      setIngredientError("Please enter an ingredient.");
      return;
    }

    const alreadyExists = ingredients.some(
      (ingredient) => ingredient.toLowerCase() === newIngredient.toLowerCase(),
    );

    if (alreadyExists) {
      setIngredientError("This ingredient is already on the list.");
      return;
    }

    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);

    setIngredientError("");
    setRecipe("");
  }

  return (
    <main>
      <form action={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>

      {ingredientError && <p role="alert">{ingredientError}</p>}
      {recipeError && <p role="alert">{recipeError}</p>}

      {ingredients.length > 0 && (
        <IngredientsList
          ingredients={ingredients}
          getRecipe={getRecipe}
          loading={loading}
        />
      )}

      {recipe && <ClaudeRecipe recipe={recipe} />}
    </main>
  );
}
