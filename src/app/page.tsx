"use client";

import { useState } from "react";
import JoinForm from "@/components/JoinForm";
import QuizInterface from "@/components/QuizInterface";
import { User, MathQuestion } from "@/types/game";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(
    null
  );
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  const handleJoin = (username: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      score: 0,
    };
    setCurrentUser(newUser);
    setUsers([newUser]);

    // Generate a sample question
    const sampleQuestion: MathQuestion = {
      question: "5 + 3",
      answer: 8,
    };
    setCurrentQuestion(sampleQuestion);
  };

  const handleAnswer = (answer: number) => {
    if (currentQuestion && answer === currentQuestion.answer) {
      setMessage("Correct! You got it right!");
      // Update user score
      setUsers((prev) =>
        prev.map((user) =>
          user.id === currentUser?.id
            ? { ...user, score: user.score + 10 }
            : user
        )
      );

      // Generate new question after 2 seconds
      setTimeout(() => {
        const newQuestion: MathQuestion = {
          question: "12 - 4",
          answer: 8,
        };
        setCurrentQuestion(newQuestion);
        setMessage("");
      }, 2000);
    } else {
      setMessage("Wrong answer, try again!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (!currentUser) {
    return <JoinForm onJoin={handleJoin} />;
  }

  return (
    <QuizInterface
      currentUser={currentUser}
      users={users}
      currentQuestion={currentQuestion}
      gameStatus="active"
      winner={null}
      onAnswer={handleAnswer}
      message={message}
    />
  );
}
