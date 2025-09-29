const now = new Date();
const expiresAt = new Date(now.getTime() + (body.is_public ? 48 : 24) * 60 * 60 * 1000);

const { data: gen, error: genErr } = await supabase
  .from('generations')
  .insert({
    user_id: user.id,
    prompt: body.prompt,
    model: body.model,
    style: body.style ?? null,
    width: body.width,
    height: body.height,
    steps: body.steps,
    cfg_scale: body.cfg_scale ?? null,
    tokens_used: cost,
    is_public: !!body.is_public,
    status: 'queued',
    expires_at: expiresAt.toISOString()
  })
  .select()
  .single();
