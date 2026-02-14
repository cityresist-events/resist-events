// GET  /api/messages/:id — get thread with replies (marks as read)
// POST /api/messages/:id — add reply to thread
// PUT  /api/messages/:id — update message (archive)

export async function onRequestGet(context) {
  const db = context.env.RESIST_DB;
  const id = context.params.id;
  const userId = context.data.demoUserId;

  try {
    const message = await db.prepare(`
      SELECT m.*, o.name as org_name
      FROM messages m
      LEFT JOIN organizations o ON m.org_id = o.id
      WHERE m.id = ?
    `).bind(id).first();

    if (!message) return Response.json({ error: 'Not found' }, { status: 404 });

    const { results: replies } = await db.prepare(`
      SELECT r.*, u.email as user_email, u.display_name as user_display_name
      FROM message_replies r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.message_id = ? ORDER BY r.created_at ASC
    `).bind(id).all();

    // Mark as read for the current user
    if (userId && replies.length > 0) {
      const latestReplyId = replies[replies.length - 1].id;
      await db.prepare(
        'INSERT INTO message_reads (user_id, message_id, last_read_reply_id) VALUES (?, ?, ?) ON CONFLICT(user_id, message_id) DO UPDATE SET last_read_reply_id = excluded.last_read_reply_id'
      ).bind(userId, id, latestReplyId).run();
    }

    return Response.json({
      ...message,
      archived: !!message.archived,
      replies,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const db = context.env.RESIST_DB;
  const id = context.params.id;
  const role = context.data.demoRole;
  const userId = context.data.demoUserId;

  if (!role || role === 'guest') {
    return Response.json({ error: 'Guests cannot reply' }, { status: 403 });
  }

  try {
    const body = await context.request.json();
    if (!body.text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const fromType = role === 'admin' ? 'admin' : 'org';
    await db.prepare(
      'INSERT INTO message_replies (message_id, from_type, text, user_id) VALUES (?, ?, ?, ?)'
    ).bind(id, fromType, body.text, userId || null).run();

    // Mark as read for the sender
    const latestReply = await db.prepare(
      'SELECT MAX(id) as max_id FROM message_replies WHERE message_id = ?'
    ).bind(id).first();
    if (userId && latestReply) {
      await db.prepare(
        'INSERT INTO message_reads (user_id, message_id, last_read_reply_id) VALUES (?, ?, ?) ON CONFLICT(user_id, message_id) DO UPDATE SET last_read_reply_id = excluded.last_read_reply_id'
      ).bind(userId, id, latestReply.max_id).run();
    }

    // If organizer replies to a thread linked to an event with pending_org status, move back to review
    if (fromType === 'org') {
      const message = await db.prepare('SELECT event_id FROM messages WHERE id = ?').bind(id).first();
      if (message && message.event_id) {
        const event = await db.prepare('SELECT status FROM events WHERE id = ?').bind(message.event_id).first();
        if (event && event.status === 'pending_org') {
          await db.prepare(
            "UPDATE events SET status = 'review', updated_at = datetime('now') WHERE id = ?"
          ).bind(message.event_id).run();
        }
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  const db = context.env.RESIST_DB;
  const id = context.params.id;

  try {
    const body = await context.request.json();

    if (body.archived !== undefined) {
      await db.prepare('UPDATE messages SET archived = ? WHERE id = ?').bind(body.archived ? 1 : 0, id).run();
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
