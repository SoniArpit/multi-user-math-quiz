# Math Quiz Challenge

A real-time multiplayer math quiz game built with Next.js and Supabase. Players compete to solve math problems as quickly as possible in a live environment.

**🎮 [Play Live Demo](https://multi-user-math-quiz.vercel.app/)**

## Project Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd math-quiz
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
math-quiz/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Main page component
│   ├── components/            # React components
│   │   ├── HighScores.tsx    # High scores display
│   │   ├── JoinForm.tsx      # User join form
│   │   ├── Leaderboard.tsx   # Live leaderboard
│   │   └── QuizInterface.tsx # Main quiz interface
│   ├── lib/                   # Utility libraries
│   │   ├── answerService.ts   # Answer submission logic
│   │   ├── notificationService.ts # Notification handling
│   │   ├── questionGenerator.ts # Math question generation
│   │   ├── questionService.ts # Question management
│   │   ├── supabase.ts       # Supabase client
│   │   └── userService.ts    # User management
│   └── types/
│       └── game.ts           # TypeScript type definitions
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Real-time)
- **Deployment**: Vercel (recommended)

## Key Features

- **Real-time multiplayer**: Multiple players can join and play simultaneously
- **Dynamic question generation**: Random math problems (addition, subtraction, multiplication, division)
- **Live leaderboard**: Real-time score tracking and ranking
- **High score persistence**: Scores are saved and displayed across sessions
- **Responsive design**: Works on desktop and mobile devices
- **Real-time notifications**: Instant feedback for correct/incorrect answers

## Game Flow

1. Players enter their username to join the game
2. Math questions are generated automatically
3. Players compete to answer questions correctly and quickly
4. Scores are tracked in real-time on the leaderboard
5. High scores are persisted and displayed

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
