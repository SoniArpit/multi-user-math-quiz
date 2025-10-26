import { supabase } from "./supabase";
import { generateNewQuestionAfterWinner } from "./questionService";
import { updateUserScore } from "./userService";
import { addNotification } from "./notificationService";

export interface AnswerResult {
  success: boolean;
  message: string;
  isWinner?: boolean;
}

// Submit answer with atomic concurrency handling
export async function submitAnswer(
  userId: string,
  answer: number
): Promise<AnswerResult> {
  try {
    console.log(`🎯 User ${userId} submitting answer: ${answer}`);

    // Get current active question
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        message: "No active question available",
      };
    }

    // Check if answer is correct
    const isCorrect = answer === question.answer;
    console.log(
      `🎯 Answer ${answer} is ${isCorrect ? "correct" : "incorrect"}`
    );

    // Record the answer attempt
    const { error: answerError } = await supabase.from("answers").insert({
      question_id: question.id,
      user_id: userId,
      answer: answer,
      is_correct: isCorrect,
    });

    if (answerError) {
      console.error("❌ Error recording answer:", answerError);
      return {
        success: false,
        message: "Error recording answer",
      };
    }

    if (isCorrect) {
      // Try to claim the win atomically
      console.log("🏆 Attempting to claim win...");

      const { data: updateData, error: updateError } = await supabase
        .from("questions")
        .update({
          winner_id: userId,
          is_active: false,
        })
        .eq("id", question.id)
        .eq("is_active", true) // Only update if still active
        .is("winner_id", null) // Only update if no winner yet (use .is() for null)
        .select(); // Return the updated row

      console.log("🏆 Update result:", { updateData, updateError });

      if (updateError) {
        console.log("❌ Database error claiming win:", updateError.message);
        return {
          success: false,
          message: "Database error occurred",
        };
      }

      if (!updateData || updateData.length === 0) {
        // No rows were updated - someone else got it first
        console.log("❌ No rows updated - someone else got it first");
        return {
          success: false,
          message: "Someone else got it first!",
        };
      }

      // Successfully claimed the win!
      console.log("🏆 Successfully claimed the win!");

      // Update user score
      const scoreUpdated = await updateUserScore(userId, 10);
      if (!scoreUpdated) {
        console.error("❌ Failed to update user score");
      }

      // Update high scores
      await updateHighScores(userId);

      // Get winner's username for global notification
      const { data: winner } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      const winnerName = winner?.username || "Someone";

      // Add global notification for all players
      await addNotification(`🏆 ${winnerName} got it right! +10 points`);

      // Generate new question after winner
      await generateNewQuestionAfterWinner();

      return {
        success: true,
        message: `You won! +10 points`,
        isWinner: true,
      };
    } else {
      return {
        success: false,
        message: "Wrong answer, try again!",
      };
    }
  } catch (error) {
    console.error("❌ Error submitting answer:", error);
    return {
      success: false,
      message: "Error submitting answer",
    };
  }
}

// Update high scores
async function updateHighScores(userId: string) {
  try {
    console.log("📊 Updating high scores...");

    // Get user's current score
    const { data: user } = await supabase
      .from("users")
      .select("username, score")
      .eq("id", userId)
      .single();

    if (!user) {
      console.error("❌ User not found for high score update");
      return;
    }

    // Check if this score qualifies for high scores
    const { data: highScores } = await supabase
      .from("high_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);

    const minHighScore =
      highScores && highScores.length > 0
        ? highScores[highScores.length - 1].score
        : 0;

    if (user.score >= minHighScore) {
      // Check if user already has a high score
      const { data: existingScore } = await supabase
        .from("high_scores")
        .select("*")
        .eq("username", user.username)
        .single();

      if (existingScore) {
        // Update existing high score if new score is higher
        if (user.score > existingScore.score) {
          const { error } = await supabase
            .from("high_scores")
            .update({ score: user.score })
            .eq("username", user.username);

          if (error) {
            console.error("❌ Error updating high score:", error);
          } else {
            console.log("✅ High score updated for", user.username);
          }
        }
      } else {
        // Insert new high score
        const { error } = await supabase.from("high_scores").insert({
          username: user.username,
          score: user.score,
        });

        if (error) {
          console.error("❌ Error inserting high score:", error);
        } else {
          console.log("✅ New high score added for", user.username);
        }
      }
    } else {
      console.log(
        "📊 Score not high enough for leaderboard:",
        user.score,
        "<",
        minHighScore
      );
    }
  } catch (error) {
    console.error("❌ Error updating high scores:", error);
  }
}

// Get high scores
export async function getHighScores() {
  try {
    console.log("📊 Loading high scores...");

    const { data: highScores, error } = await supabase
      .from("high_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);

    if (error) {
      console.error("❌ Error loading high scores:", error);
      return [];
    }

    console.log(`✅ Loaded ${highScores?.length || 0} high scores`);
    return highScores || [];
  } catch (error) {
    console.error("❌ Error loading high scores:", error);
    return [];
  }
}
