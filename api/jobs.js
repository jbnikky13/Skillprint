import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return res.status(503).json({ error: "Skillprint database is not configured." });
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("jobs")
    .select("id,title,company,location,remote,url,score,recommended_cv_id,reasons,source")
    .order("score", { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ jobs: data ?? [] });
}
