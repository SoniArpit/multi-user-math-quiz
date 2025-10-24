"use client";

import { useState, useEffect } from "react";
import { MathQuestion, User } from "@/types/game";
import Leaderboard from "./Leaderboard";
import HighScores from "./HighScores";

interface QuizInterfaceProps {
  currentUser: User;
  users: User[];
  currentQuestion: MathQuestion | null;
  gameStatus: "waiting" | "active" | "scoring";
  winner: User | null;
  onAnswer: (answer: number) => void;
  message?: string;
}

export default function QuizInterface({
  currentUser,
  users,
  currentQuestion,
  gameStatus,
  winner,
  onAnswer,
  message: externalMessage,
}: QuizInterfaceProps) {
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // get userId from local storage

  useEffect(() => {
    setAnswer("");
    setMessage("");
  }, [currentQuestion]);

  useEffect(() => {
    if (winner) {
      setMessage(`${winner.username} got it right! +10 points`);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [winner]);

  useEffect(() => {
    if (externalMessage) {
      setMessage(externalMessage);
    }
  }, [externalMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const numAnswer = Number(answer);

    if (isNaN(numAnswer)) {
      setMessage("Please enter a valid number");
      setIsSubmitting(false);
      return;
    }

    onAnswer(numAnswer);
    setIsSubmitting(false);
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case "waiting":
        return "Waiting for players...";
      case "scoring":
        return "Calculating scores...";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quiz Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Math Quiz Challenge
              </h1>
              <p className="text-gray-600">
                Welcome,{" "}
                <span className="font-semibold text-blue-600">
                  {currentUser.username}
                </span>
                !
              </p>
            </div>

            {currentQuestion ? (
              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-8 mb-6">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    {currentQuestion.question} = ?
                  </h2>

                  {message && (
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        message.includes("got it right")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <input
                      type="number"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Your answer..."
                      className="w-full px-4 py-3 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4 text-black"
                      disabled={gameStatus !== "active" || isSubmitting}
                      autoFocus
                    />

                    <button
                      type="submit"
                      disabled={
                        gameStatus !== "active" ||
                        isSubmitting ||
                        !answer.trim()
                      }
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Answer"}
                    </button>
                  </form>
                </div>

                {gameStatus !== "active" && (
                  <div className="text-center">
                    <p className="text-lg text-gray-600">
                      {getStatusMessage()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">Answering...</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with Leaderboard and High Scores */}
        <div className="lg:col-span-1 space-y-6">
          <Leaderboard users={users} currentUserId={currentUser.id} />
          <HighScores />
        </div>
      </div>
    </div>
  );
}
