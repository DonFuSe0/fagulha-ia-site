const { data: profile } = await supabase
  .from("profiles")
  .select("avatar_url, nickname, credits")
  .eq("id", user.id)
  .maybeSingle();

const metaNick = (user.user_metadata && typeof user.user_metadata.nickname === "string")
  ? String(user.user_metadata.nickname) : null;

const nickname = profile?.nickname ?? metaNick ?? (user.email?.split("@")[0] ?? null);
const credits = profile?.credits ?? null;
