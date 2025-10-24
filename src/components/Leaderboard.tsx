"use client";

import { User } from "@/types/game";

interface LeaderboardProps {
  users: User[];
  currentUserId?: string;
}

export default function Leaderboard({
  users,
  currentUserId,
}: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-fit">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Leaderboard</h2>

      <div className="space-y-2">
        {sortedUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No players yet</p>
        ) : (
          sortedUsers.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.id === currentUserId
                  ? "bg-blue-100 border-2 border-blue-300"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
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
                <span
                  className={`font-medium ${
                    user.id === currentUserId
                      ? "text-blue-800"
                      : "text-gray-700"
                  }`}
                >
                  {user.username}
                  {user.id === currentUserId && " (You)"}
                </span>
              </div>
              <span className="font-bold text-lg text-gray-800">
                {user.score}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          {users.length} player{users.length !== 1 ? "s" : ""} online
        </p>
      </div>
    </div>
  );
}
