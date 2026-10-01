# Chef Claude — AI Recipe Generator

Chef Claude is an AI-powered recipe generator that helps users create recipes from ingredients they already have available. Built with React and Express, the application uses the Hugging Face Inference API to generate recipes with ingredients, step-by-step instructions, and cooking tips.

## Features

- Generate recipes based on available ingredients
- Validate ingredient inputs and handle invalid requests
- Display AI-generated recipes with Markdown formatting
- Provide loading states and error handling
- Responsive user interface with a clean, minimal design

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **AI Integration:** Hugging Face Inference API
- **Markdown Rendering:** React Markdown

## Getting Started

### Prerequisites

- Node.js and npm
- A Hugging Face access token with access to the selected model

### Installation

Clone the repository and navigate to the project directory:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd react-section3-chef-claude
```

Install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
HF_TOKEN=your_hugging_face_token
FRONTEND_ORIGIN=http://localhost:5173
```

Replace the placeholder with your Hugging Face access token. Keep your `.env` file private and never commit secrets to version control.

### Run the Application

Start the backend in one terminal:

```bash
node server.js
```

Start the frontend in a separate terminal:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## Available Scripts

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Starts the frontend development server |
| `npm run build`   | Builds the frontend for production     |
| `npm run preview` | Previews the production build          |
| `npm run lint`    | Runs Oxlint                            |

## Project Structure

```text
src/
├── components/
│   ├── ClaudeRecipe.jsx
│   ├── Header.jsx
│   ├── IngredientsList.jsx
│   └── Main.jsx
├── images/
│   └── chef-claude-icon.png
├── ai.js
├── App.jsx
├── index.css
└── main.jsx

server.js
package.json
package-lock.json
```

## Future Improvements

- Deploy the application for public access
- Add automated tests
- Allow users to save favorite recipes

## Purpose

This project demonstrates frontend development with React, backend API development with Express, input validation, and integration with an AI inference service.
