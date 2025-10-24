import { supabase } from "./supabase";
import { User } from "@/types/game";

// Global state for users
let users: User[] = [];
let listeners: ((users: User[]) => void)[] = [];

// Helper function to notify all listeners
function notifyListeners() {
  listeners.forEach((listener) => listener(users));
}

// Function 1: Join Game - Create or get user
export async function joinGame(username: string): Promise<User> {
  try {
    console.log(`🔍 Joining game as: ${username}`);

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    console.log("🔍 Fetch result:", { existingUser, fetchError });

    let user: User;

    if (existingUser && !fetchError) {
      // User exists, return existing data
      user = {
        id: existingUser.id,
        username: existingUser.username,
        score: existingUser.score,
      };
      console.log(
        `✅ Existing user found: ${user.username} (score: ${user.score})`
      );
    } else {
      // Create new user
      console.log("🆕 Creating new user...");
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          username,
          score: 0,
        })
        .select()
        .single();

      console.log("🆕 Insert result:", { newUser, insertError });

      if (insertError) {
        console.error("❌ Error creating user:", insertError);
        throw insertError;
      }

      if (!newUser) {
        throw new Error("Failed to create user - no data returned");
      }

      user = {
        id: newUser.id,
        username: newUser.username,
        score: newUser.score,
      };
      console.log(`✅ New user created: ${user.username}`);
    }

    return user;
  } catch (error) {
    console.error("❌ Error joining game:", error);
    throw error;
  }
}

// Function 2: Load all users from database
async function loadUsers() {
  try {
    console.log("📥 Loading users from database...");

    const { data: usersData, error } = await supabase
      .from("users")
      .select("*")
      .order("score", { ascending: false });

    if (error) {
      console.error("❌ Error loading users:", error);
      return;
    }

    if (usersData) {
      users = usersData.map((user) => ({
        id: user.id,
        username: user.username,
        score: user.score,
      }));

      console.log(
        `✅ Loaded ${users.length} users:`,
        users.map((u) => `${u.username}(${u.score})`)
      );
      notifyListeners();
    }
  } catch (error) {
    console.error("❌ Error loading users:", error);
  }
}

// Function 3: Set up real-time subscription for users
function setupUserSubscription() {
  console.log("🔗 Setting up user subscription...");

  supabase
    .channel("users")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users",
      },
      async (payload) => {
        console.log("📡 User change detected:", payload);
        await loadUsers();
      }
    )
    .subscribe();
}

// Function 4: Subscribe to user changes
export function subscribeToUsers(listener: (users: User[]) => void) {
  console.log("👂 Subscribing to user changes...");
  listeners.push(listener);

  // Immediately call with current users
  listener(users);

  // Set up real-time subscription
  setupUserSubscription();

  // Load users from database
  loadUsers();
}

// Function 5: Unsubscribe from user changes
export function unsubscribeFromUsers(listener: (users: User[]) => void) {
  console.log("🔇 Unsubscribing from user changes...");
  listeners = listeners.filter((l) => l !== listener);
}

// Function 6: Get current users
export function getCurrentUsers(): User[] {
  return users;
}

// Function 7: Update user score
export async function updateUserScore(
  userId: string,
  scoreIncrement: number
): Promise<boolean> {
  try {
    console.log(`📈 Updating score for user ${userId} by +${scoreIncrement}`);

    // Get current user
    const { data: currentUser } = await supabase
      .from("users")
      .select("score")
      .eq("id", userId)
      .single();

    if (!currentUser) {
      console.error("❌ User not found");
      return false;
    }

    const newScore = currentUser.score + scoreIncrement;

    // Update score in database
    const { error } = await supabase
      .from("users")
      .update({
        score: newScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("❌ Error updating user score:", error);
      return false;
    }

    console.log(`✅ Score updated: ${currentUser.score} → ${newScore}`);
    return true;
  } catch (error) {
    console.error("❌ Error updating user score:", error);
    return false;
  }
}
