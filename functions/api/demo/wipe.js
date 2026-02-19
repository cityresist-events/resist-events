// POST /api/demo/wipe — execute full DB wipe after email verification

export async function onRequestPost(context) {
  const db = context.env.RESIST_DB;

  try {
    const body = await context.request.json();
    const { email, confirm } = body;

    if (!email || confirm !== 'WIPE') {
      return Response.json({ error: 'Email and confirmation word "WIPE" are required' }, { status: 400 });
    }

    // Re-verify email match (don't trust client state alone)
    let storedEmail = context.env.DEMO_MODE_EMAIL;
    if (!storedEmail) {
      const emailRow = await db.prepare("SELECT value FROM site_config WHERE key = 'demo_admin_email'").first();
      storedEmail = emailRow ? emailRow.value : null;
    }

    if (!storedEmail || email.toLowerCase().trim() !== storedEmail.toLowerCase().trim()) {
      return Response.json({ ok: false, error: 'Email verification failed' }, { status: 403 });
    }

    // Verify app is in demo mode
    const modeRow = await db.prepare("SELECT value FROM site_config WHERE key = 'app_mode'").first();
    if (!modeRow || modeRow.value !== 'demo') {
      return Response.json({ error: 'App is not in demo mode' }, { status: 400 });
    }

    // Truncate all tables (order matters for FK constraints)
    await db.batch([
      db.prepare("DELETE FROM event_published_seen"),
      db.prepare("DELETE FROM review_seen"),
      db.prepare("DELETE FROM message_reads"),
      db.prepare("DELETE FROM user_orgs"),
      db.prepare("DELETE FROM message_replies"),
      db.prepare("DELETE FROM messages"),
      db.prepare("DELETE FROM event_flyers"),
      db.prepare("DELETE FROM events"),
      db.prepare("DELETE FROM users"),
      db.prepare("DELETE FROM organizations"),
      db.prepare("DELETE FROM site_config"),
    ]);

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
