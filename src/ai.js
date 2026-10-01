export async function getRecipeFromMistral(ingredientsArr) {
  const response = await fetch("http://localhost:3001/recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ingredients: ingredientsArr,
    }),
  });

  const data = await response.json();

  console.log("DATA FROM BACKEND:", data);

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate recipe.");
  }

  if (!data.recipe) {
    throw new Error("The server did not return a recipe.");
  }

  return data.recipe;
}
