// POST /api/events/seen — mark review queue events as seen by admin

export async function onRequestPost(context) {
  const db = context.env.RESIST_DB;
  const role = context.data.demoRole;
  const userId = context.data.demoUserId;

  if (role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  try {
    const body = await context.request.json();
    const eventIds = body.event_ids || [];

    for (const eventId of eventIds) {
      await db.prepare(
        'INSERT INTO review_seen (user_id, event_id) VALUES (?, ?) ON CONFLICT(user_id, event_id) DO NOTHING'
      ).bind(userId, eventId).run();
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
