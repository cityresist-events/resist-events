// GET  /api/messages — list message topics (with unread info)
// POST /api/messages — create new topic with first message

export async function onRequestGet(context) {
  const db = context.env.RESIST_DB;
  const role = context.data.demoRole;
  const userId = context.data.demoUserId;

  try {
    let results;
    if (role === 'admin') {
      // Admin sees all messages
      ({ results } = await db.prepare(`
        SELECT m.*, o.name as org_name,
          (SELECT MAX(r.id) FROM message_replies r WHERE r.message_id = m.id) as latest_reply_id,
          COALESCE((SELECT mr.last_read_reply_id FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id = ?), 0) as last_read_reply_id
        FROM messages m
        LEFT JOIN organizations o ON m.org_id = o.id
        ORDER BY m.created_at DESC
      `).bind(userId || 0).all());
    } else {
      // Organizer sees their org's messages
      let orgId = null;
      if (userId) {
        const user = await db.prepare('SELECT org_id FROM users WHERE id = ?').bind(userId).first();
        if (user) orgId = user.org_id;
      }
      ({ results } = await db.prepare(`
        SELECT m.*, o.name as org_name,
          (SELECT MAX(r.id) FROM message_replies r WHERE r.message_id = m.id) as latest_reply_id,
          COALESCE((SELECT mr.last_read_reply_id FROM message_reads mr WHERE mr.message_id = m.id AND mr.user_id = ?), 0) as last_read_reply_id
        FROM messages m
        LEFT JOIN organizations o ON m.org_id = o.id
        WHERE m.org_id = ?
        ORDER BY m.created_at DESC
      `).bind(userId || 0, orgId || 0).all());
    }

    const messages = results.map(row => ({
      ...row,
      archived: !!row.archived,
      has_unread: (row.latest_reply_id || 0) > (row.last_read_reply_id || 0),
    }));

    return Response.json(messages);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const db = context.env.RESIST_DB;
  const role = context.data.demoRole;
  const userId = context.data.demoUserId;

  if (!role || role === 'guest') {
    return Response.json({ error: 'Guests cannot send messages' }, { status: 403 });
  }

  try {
    const body = await context.request.json();
    if (!body.topic || !body.text) {
      return Response.json({ error: 'Topic and text are required' }, { status: 400 });
    }

    // Get org id — admin can specify org_id to message any org
    let orgId = null;
    if (role === 'admin' && body.org_id) {
      orgId = body.org_id;
    } else if (userId) {
      const user = await db.prepare('SELECT org_id FROM users WHERE id = ?').bind(userId).first();
      if (user) orgId = user.org_id;
    }

    // Create message topic (with optional event_id)
    const eventId = body.event_id || null;
    const msgResult = await db.prepare(
      'INSERT INTO messages (topic, org_id, event_id) VALUES (?, ?, ?)'
    ).bind(body.topic, orgId, eventId).run();

    const messageId = msgResult.meta.last_row_id;

    // Add first reply
    const fromType = role === 'admin' ? 'admin' : 'org';
    await db.prepare(
      'INSERT INTO message_replies (message_id, from_type, text, user_id) VALUES (?, ?, ?, ?)'
    ).bind(messageId, fromType, body.text, userId || null).run();

    // Mark as read for the sender
    const latestReply = await db.prepare(
      'SELECT MAX(id) as max_id FROM message_replies WHERE message_id = ?'
    ).bind(messageId).first();
    if (userId && latestReply) {
      await db.prepare(
        'INSERT INTO message_reads (user_id, message_id, last_read_reply_id) VALUES (?, ?, ?) ON CONFLICT(user_id, message_id) DO UPDATE SET last_read_reply_id = excluded.last_read_reply_id'
      ).bind(userId, messageId, latestReply.max_id).run();
    }

    // If admin is messaging about a specific event, mark it as pending organizer response
    if (role === 'admin' && eventId) {
      await db.prepare(
        "UPDATE events SET status = 'pending_org', updated_at = datetime('now') WHERE id = ?"
      ).bind(eventId).run();
    }

    return Response.json({ ok: true, id: messageId });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
