# InterviewAI - AI-Powered Interview Preparation

An AI-powered interview preparation platform for students and freshers. Practice technical and HR interviews with real-time feedback, detailed scoring, and personalized improvement suggestions.

## Features

- **Technical Interviews**: Practice coding and technical questions with AI
- **HR Interviews**: Prepare for behavioral and situational questions
- **Full Interview Mode**: Combined technical + HR simulation
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Real-time Feedback**: Get instant AI-powered evaluation
- **Score Analytics**: Track your progress with detailed metrics

## Getting Started

**Use your preferred IDE**

Clone this repo and push changes to deploy.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Deploy using Vercel, Netlify, or any static hosting service:

```sh
npm run build
# Deploy the 'dist' folder
```

## Environment Variables

Create a `.env` file in the frontend folder:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
