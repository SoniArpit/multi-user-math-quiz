import { supabase } from "./supabase";
import { generateMathQuestion, MathQuestion } from "./questionGenerator";

// Global state for current question
let currentQuestion: MathQuestion | null = null;
let questionListeners: ((question: MathQuestion | null) => void)[] = [];

// Helper function to notify all listeners
function notifyQuestionListeners() {
  questionListeners.forEach((listener) => listener(currentQuestion));
}

// Function 1: Generate and store new question
export async function generateNewQuestion(): Promise<MathQuestion> {
  try {
    console.log("🎯 Generating new question...");

    // Deactivate current question
    await supabase
      .from("questions")
      .update({ is_active: false })
      .eq("is_active", true);

    // Generate new question
    const newQuestion = generateMathQuestion();
    console.log("🎯 Generated question:", newQuestion);

    // Store in database
    const { data, error } = await supabase
      .from("questions")
      .insert({
        question_text: newQuestion.question,
        answer: newQuestion.answer,
        is_active: true,
        winner_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error storing question:", error);
      throw error;
    }

    if (!data) {
      throw new Error("Failed to store question - no data returned");
    }

    // Update global state
    currentQuestion = {
      question: data.question_text,
      answer: data.answer,
    };

    console.log("✅ New question stored and activated:", currentQuestion);
    notifyQuestionListeners();

    return currentQuestion;
  } catch (error) {
    console.error("❌ Error generating new question:", error);
    throw error;
  }
}

// Function 2: Load current active question
async function loadCurrentQuestion() {
  try {
    console.log("📥 Loading current question...");

    const { data: question, error } = await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No active question found - this is normal
        console.log("📭 No active question found");
        currentQuestion = null;
      } else {
        console.error("❌ Error loading current question:", error);
        return;
      }
    } else if (question) {
      currentQuestion = {
        question: question.question_text,
        answer: question.answer,
      };
      console.log("✅ Current question loaded:", currentQuestion);
    } else {
      currentQuestion = null;
      console.log("📭 No active question found");
    }

    notifyQuestionListeners();
  } catch (error) {
    console.error("❌ Error loading current question:", error);
  }
}

// Function 3: Set up real-time subscription for questions
function setupQuestionSubscription() {
  console.log("🔗 Setting up question subscription...");

  supabase
    .channel("questions")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "questions",
      },
      async (payload) => {
        console.log("📡 Question change detected:", payload);
        await loadCurrentQuestion();
      }
    )
    .subscribe();
}

// Function 4: Subscribe to question changes
export function subscribeToQuestions(
  listener: (question: MathQuestion | null) => void
) {
  console.log("👂 Subscribing to question changes...");
  questionListeners.push(listener);

  // Immediately call with current question
  listener(currentQuestion);

  // Set up real-time subscription
  setupQuestionSubscription();

  // Load current question from database
  loadCurrentQuestion();
}

// Function 5: Unsubscribe from question changes
export function unsubscribeFromQuestions(
  listener: (question: MathQuestion | null) => void
) {
  console.log("🔇 Unsubscribing from question changes...");
  questionListeners = questionListeners.filter((l) => l !== listener);
}

// Function 6: Get current question
export function getCurrentQuestion(): MathQuestion | null {
  return currentQuestion;
}

// Function 7: Ensure there's an active question (used when joining game)
export async function ensureActiveQuestion(): Promise<MathQuestion> {
  try {
    console.log("🔍 Ensuring active question...");

    // Check if there's already an active question
    const { data: activeQuestion, error } = await supabase
      .from("questions")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("❌ Error checking for active question:", error);
      throw error;
    }

    if (activeQuestion) {
      currentQuestion = {
        question: activeQuestion.question_text,
        answer: activeQuestion.answer,
      };
      console.log("✅ Active question found:", currentQuestion);
      notifyQuestionListeners();
      return currentQuestion;
    } else {
      // No active question, generate one
      console.log("🆕 No active question, generating new one...");
      return await generateNewQuestion();
    }
  } catch (error) {
    console.error("❌ Error ensuring active question:", error);
    throw error;
  }
}

// Function 8: Mark question as answered by winner
export async function markQuestionAnswered(
  questionId: string,
  winnerId: string
): Promise<boolean> {
  try {
    console.log(`🏆 Marking question ${questionId} as answered by ${winnerId}`);

    const { error } = await supabase
      .from("questions")
      .update({
        winner_id: winnerId,
        is_active: false,
      })
      .eq("id", questionId)
      .eq("is_active", true); // Only update if still active

    if (error) {
      console.error("❌ Error marking question as answered:", error);
      return false;
    }

    console.log("✅ Question marked as answered");
    return true;
  } catch (error) {
    console.error("❌ Error marking question as answered:", error);
    return false;
  }
}

// Function 9: Generate new question after winner (called automatically)
export async function generateNewQuestionAfterWinner(): Promise<void> {
  try {
    console.log("🎯 Generating new question after winner...");

    // Wait a bit to show the winner message
    setTimeout(async () => {
      try {
        await generateNewQuestion();
        console.log("✅ New question generated after winner");
      } catch (error) {
        console.error("❌ Error generating new question after winner:", error);
      }
    }, 3000); // Wait 3 seconds before generating new question
  } catch (error) {
    console.error("❌ Error in generateNewQuestionAfterWinner:", error);
  }
}
