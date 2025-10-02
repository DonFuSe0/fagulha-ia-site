const userId = data.user?.id;
if (userId && nickname && nickname.trim()) {
  const { data: prof } = await admin.from("profiles").select("id, nickname").eq("id", userId).maybeSingle();
  if (!prof || !prof.nickname) {
    await admin.from("profiles").update({ nickname: nickname.trim() }).eq("id", userId);
  }
}
