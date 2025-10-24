"use client";

export default function HighScores() {
  // Static high scores for demo
  const highScores = [
    { username: "Alice", score: 150 },
    { username: "Bob", score: 120 },
    { username: "Charlie", score: 90 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">High Scores</h2>

      <div className="space-y-2">
        {highScores.map((score, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
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
    </div>
  );
}
