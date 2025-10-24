// Simple test to check Supabase connection
// Run with: node test-supabase.js

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

// You need to add your actual Supabase credentials here
console.log("Environment URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "Environment Key:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Found" : "Not found"
);

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "your_supabase_url_here";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your_supabase_key_here";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔍 Testing Supabase connection...");
  console.log("URL:", supabaseUrl);
  console.log("Key:", supabaseKey.substring(0, 20) + "...");

  try {
    // Test basic connection
    const { data, error } = await supabase.from("users").select("*").limit(1);

    if (error) {
      console.error("❌ Error:", error.message);
      console.log("💡 Make sure you have:");
      console.log("   1. Created .env.local with your Supabase credentials");
      console.log("   2. Created the database tables in Supabase dashboard");
      console.log("   3. Set up the correct environment variables");
    } else {
      console.log("✅ Supabase connection working!");
      console.log("📊 Data:", data);
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    console.log("💡 Check your .env.local file and Supabase project setup");
  }
}

testConnection();
