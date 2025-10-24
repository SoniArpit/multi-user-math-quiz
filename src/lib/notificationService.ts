import { supabase } from "./supabase";

// Global state for notifications
let notifications: string[] = [];
let notificationListeners: ((notifications: string[]) => void)[] = [];

// Helper function to notify all listeners
function notifyListeners() {
  notificationListeners.forEach((listener) => listener(notifications));
}

// Function 1: Add a global notification (broadcast to all players)
export async function addNotification(message: string) {
  console.log("📢 Broadcasting notification:", message);

  try {
    // Store notification in database for real-time broadcasting
    const { error } = await supabase.from("notifications").insert({
      message: message,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Error broadcasting notification:", error);
    } else {
      console.log("✅ Notification broadcasted to all players");
    }
  } catch (error) {
    console.error("❌ Error broadcasting notification:", error);
  }
}

// Function 2: Remove a notification
export function removeNotification(message: string) {
  notifications = notifications.filter((n) => n !== message);
  notifyListeners();
}

// Function 3: Subscribe to notifications
export function subscribeToNotifications(
  listener: (notifications: string[]) => void
) {
  console.log("👂 Subscribing to notifications...");
  notificationListeners.push(listener);

  // Clear any existing notifications to avoid showing old ones
  notifications = [];
  notifyListeners();

  // Set up real-time subscription for notifications
  supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        console.log("📡 New notification received:", payload);
        const message = payload.new.message;
        notifications = [message]; // Replace with latest notification
        notifyListeners();

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          removeNotification(message);
        }, 5000);
      }
    )
    .subscribe();

  // Start with empty notifications
  listener(notifications);
}

// Function 4: Unsubscribe from notifications
export function unsubscribeFromNotifications(
  listener: (notifications: string[]) => void
) {
  console.log("🔇 Unsubscribing from notifications...");
  notificationListeners = notificationListeners.filter((l) => l !== listener);
}

// Function 5: Get current notifications
export function getCurrentNotifications(): string[] {
  return notifications;
}

// Function 6: Clear all notifications
export function clearAllNotifications() {
  notifications = [];
  notifyListeners();
}

// Function 7: Clear notifications on page load
export function clearNotificationsOnLoad() {
  console.log("🧹 Clearing notifications on page load...");
  notifications = [];
  notifyListeners();
}
