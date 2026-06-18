import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvfavyoydoheumvisbem.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZmF2eW95ZG9oZXVtdmlzYmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTQ2NDgsImV4cCI6MjA5NzM3MDY0OH0.bqxJFhTG2Ggjk9a3d8nmxInjUttcVw8IeP8uQKdvZMc";

export const supabase = createClient(supabaseUrl, supabaseKey);