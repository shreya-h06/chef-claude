export default function IngredientsList(props) {
  const ingredientsListItems = props.ingredients.map((ingredient, index) => (
    <li key={`${ingredient}-${index}`}>{ingredient}</li>
  ));

  return (
    <section>
      <h2>Ingredients on hand:</h2>

      <ul className="ingredients-list" aria-live="polite">
        {ingredientsListItems}
      </ul>

      {props.ingredients.length > 3 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>

            <p>
              {props.loading
                ? "Chef Claude is cooking up something delicious..."
                : "Generate a recipe from your list of ingredients."}
            </p>
          </div>

          <button
            onClick={props.getRecipe}
            disabled={props.loading}
            aria-busy={props.loading}
          >
            {props.loading ? "Generating..." : "Get a recipe"}
          </button>
        </div>
      )}
    </section>
  );
}
