"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface HighScore {
  username: string;
  score: number;
  achieved_at: string;
}

export default function HighScores() {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighScores();

    // Set up real-time subscription for high scores updates
    const channel = supabase
      .channel("high_scores_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "high_scores",
        },
        () => {
          console.log("📊 High scores updated, reloading...");
          // Show a brief update indicator
          setLoading(true);
          loadHighScores();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadHighScores = async () => {
    try {
      const { data, error } = await supabase
        .from("high_scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error loading high scores:", error);
      } else {
        setHighScores(data || []);
      }
    } catch (error) {
      console.error("Error loading high scores:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">High Scores</h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">High Scores</h2>
        <button
          onClick={loadHighScores}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 text-2xl"
        >
          {loading ? "⟳" : "↻"}
        </button>
      </div>

      {highScores.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">No high scores yet!</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to score!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {highScores.map((score, index) => (
            <div
              key={`${score.username}-${score.score}-${score.achieved_at}`}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-yellow-900"
                      : index === 1
                        ? "bg-gray-300 text-gray-700"
                        : index === 2
                          ? "bg-orange-400 text-orange-900"
                          : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-medium text-gray-700">
                  {score.username}
                </span>
              </div>
              <span className="font-bold text-gray-800">{score.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
