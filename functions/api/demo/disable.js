// POST /api/demo/disable — verify recovery email before wipe

export async function onRequestPost(context) {
  const db = context.env.RESIST_DB;

  try {
    const body = await context.request.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check app is actually in demo mode
    const modeRow = await db.prepare("SELECT value FROM site_config WHERE key = 'app_mode'").first();
    if (!modeRow || modeRow.value !== 'demo') {
      return Response.json({ error: 'App is not in demo mode' }, { status: 400 });
    }

    // Get the recovery email — prefer env var (local dev), fall back to DB
    let storedEmail = context.env.DEMO_MODE_EMAIL;
    if (!storedEmail) {
      const emailRow = await db.prepare("SELECT value FROM site_config WHERE key = 'demo_admin_email'").first();
      storedEmail = emailRow ? emailRow.value : null;
    }

    if (!storedEmail) {
      return Response.json({ error: 'No recovery email configured' }, { status: 500 });
    }

    if (email.toLowerCase().trim() !== storedEmail.toLowerCase().trim()) {
      return Response.json({ ok: false, error: 'Email does not match' });
    }

    return Response.json({ ok: true, confirmed: false });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
