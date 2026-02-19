// GET /api/boot — returns current app mode for frontend routing

export async function onRequestGet(context) {
  const db = context.env.RESIST_DB;

  // Local dev bypass
  if (context.env.SKIP_SETUP_WIZARD === 'true') {
    return Response.json({ mode: 'demo', skip_wizard: true });
  }

  try {
    const row = await db.prepare("SELECT value FROM site_config WHERE key = 'app_mode'").first();
    if (!row) {
      return Response.json({ mode: 'setup_required', skip_wizard: false });
    }
    return Response.json({ mode: row.value, skip_wizard: false });
  } catch (e) {
    // Table might not exist yet on a truly fresh install
    return Response.json({ mode: 'setup_required', skip_wizard: false });
  }
}
