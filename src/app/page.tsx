"use client";

import { useState, useEffect } from "react";
import JoinForm from "@/components/JoinForm";
import QuizInterface from "@/components/QuizInterface";
import { User, MathQuestion } from "@/types/game";
import {
  joinGame,
  subscribeToUsers,
  unsubscribeFromUsers,
} from "@/lib/userService";
import {
  subscribeToQuestions,
  unsubscribeFromQuestions,
  ensureActiveQuestion,
} from "@/lib/questionService";
import { submitAnswer } from "@/lib/answerService";
import {
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "@/lib/notificationService";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(
    null
  );
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "active" | "scoring"
  >("waiting");

  // Set up real-time subscriptions
  useEffect(() => {
    if (currentUser) {
      console.log("🎮 Setting up real-time subscriptions...");

      // User subscription
      const handleUsersUpdate = (updatedUsers: User[]) => {
        console.log("📡 Users updated:", updatedUsers);
        setUsers(updatedUsers);
      };

      // Question subscription
      const handleQuestionUpdate = (question: MathQuestion | null) => {
        console.log("📡 Question updated:", question);
        setCurrentQuestion(question);
      };

      // Notification subscription
      const handleNotificationUpdate = (newNotifications: string[]) => {
        console.log("📡 Notifications updated:", newNotifications);
        setNotifications(newNotifications);
      };

      subscribeToUsers(handleUsersUpdate);
      subscribeToQuestions(handleQuestionUpdate);
      subscribeToNotifications(handleNotificationUpdate);

      // Ensure there's an active question
      ensureActiveQuestion().catch((error) => {
        console.error("❌ Failed to ensure active question:", error);
      });

      // Cleanup on unmount
      return () => {
        unsubscribeFromUsers(handleUsersUpdate);
        unsubscribeFromQuestions(handleQuestionUpdate);
        unsubscribeFromNotifications(handleNotificationUpdate);
      };
    }
  }, [currentUser]);

  const handleJoin = async (username: string) => {
    try {
      console.log(`🎮 User ${username} is joining the game...`);

      // Use the new joinGame function
      const user = await joinGame(username);

      setCurrentUser(user);
      setGameStatus("active"); // Set game to active when user joins
    } catch (error) {
      console.error("❌ Failed to join game:", error);
      // You could show an error message to the user here
    }
  };

  const handleAnswer = async (answer: number) => {
    if (!currentUser) {
      setMessage("No user logged in");
      return;
    }

    try {
      console.log(`🎯 Submitting answer: ${answer}`);

      const result = await submitAnswer(currentUser.id, answer);

      if (result.success) {
        setMessage(result.message);

        if (result.isWinner) {
          // Winner! Show celebration message
          console.log("🏆 User won this round!");
          setMessage("🏆 " + result.message + " New question coming soon...");
          setGameStatus("scoring"); // Only set to scoring when someone actually wins
        }
      } else {
        setMessage(result.message);
        // Keep game status as "active" for wrong answers
      }

      // Clear message after appropriate time
      const clearTime = result.isWinner ? 5000 : 2000; // 5 seconds for winners, 2 for others
      setTimeout(() => {
        setMessage("");
        setGameStatus("active"); // Reset to active after timeout
      }, clearTime);
    } catch (error) {
      console.error("❌ Error submitting answer:", error);
      setMessage("Error submitting answer. Please try again.");
      setGameStatus("active"); // Reset to active on error
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (!currentUser) {
    return <JoinForm onJoin={handleJoin} />;
  }

  return (
    <div>
      {/* Global Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {notifications[notifications.length - 1]}
        </div>
      )}

      <QuizInterface
        currentUser={currentUser}
        users={users}
        currentQuestion={currentQuestion}
        gameStatus={gameStatus}
        onAnswer={handleAnswer}
        message={message}
      />
    </div>
  );
}
