# Grammar Galaxy

An interactive English learning game suite powered by Google's Gemini AI. Practice grammar through various engaging games including Grammar Spotter, Grammar Fill, Preposition Drop, Grammar Maze, Dialogue Builder, and Emoji Guess Challenge.

## Features

- **Grammar Spotter**: Identify grammatical errors in sentences
- **Grammar Fill**: Fill in the blanks with correct grammar
- **Preposition Drop**: Practice prepositions through interactive exercises
- **Grammar Maze**: Navigate through grammar challenges
- **Dialogue Builder**: Build conversations for different scenarios
- **Emoji Guess Challenge**: Create sentences based on emoji sequences
- **Leaderboard**: Track your progress and scores

## Setup

### Prerequisites

- Node.js (version 16 or higher)
- A Google Gemini API key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your API key:
   - Create a `.env.local` file in the project root
   - Add your Gemini API key:
   ```
   API_KEY=your_gemini_api_key_here
   ```
   
   **How to get a Gemini API key:**
   1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   2. Sign in with your Google account
   3. Click "Create API Key"
   4. Copy the generated key and paste it in your `.env.local` file

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

The application supports the following environment variables:

- `API_KEY`: Your Google Gemini API key (required)
- `GEMINI_API_KEY`: Alternative name for the API key (also supported)

## Troubleshooting

### API Connection Issues

If you're experiencing API connection problems:

1. **Check your API key**: Ensure your API key is correctly set in the `.env.local` file
2. **Restart the server**: After adding the API key, restart your development server
3. **Test connection**: Use the "Test Connection" button on the API warning screen
4. **Check console**: Open browser developer tools to see detailed error messages

### Common Issues

- **"API Key Required" screen**: Your API key is not configured or the server needs to be restarted
- **"Failed to load questions"**: Check your internet connection and API key validity
- **JSON parsing errors**: The API response format may have changed; check the console for details

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Technologies Used

- React 19
- TypeScript
- Vite
- Google Gemini AI API
- Tailwind CSS
