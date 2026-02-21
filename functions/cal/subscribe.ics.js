function icalEscape(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldLine(line) {
  // RFC 5545: lines must be <= 75 octets; fold with CRLF + space
  const result = [];
  while (line.length > 75) {
    result.push(line.substring(0, 75));
    line = ' ' + line.substring(75);
  }
  result.push(line);
  return result.join('\r\n');
}

function normalizeTime(timeStr) {
  // Handles "10:00 AM", "6:00 PM", "14:30", "14:30:00"
  if (!timeStr) return null;
  const ampm = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = ampm[2];
    const s = ampm[3] || '00';
    const period = ampm[4].toUpperCase();
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}:${s}`;
  }
  return timeStr; // already 24-hour
}

function formatDate(dateStr, timeStr) {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM, HH:MM:SS, "10:00 AM", or null
  const datePart = dateStr.replace(/-/g, '');
  const normalized = normalizeTime(timeStr);
  if (!normalized) {
    return { value: datePart, isAllDay: true };
  }
  const timePart = normalized.replace(/:/g, '').substring(0, 6).padEnd(6, '0');
  return { value: `${datePart}T${timePart}`, isAllDay: false };
}

function addOneHour(timeStr) {
  const normalized = normalizeTime(timeStr) || '00:00:00';
  const parts = normalized.split(':').map(Number);
  const h = (parts[0] + 1) % 24;
  const m = parts[1] || 0;
  const s = parts[2] || 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function nextDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().substring(0, 10).replace(/-/g, '');
}

function toICalTimestampUTC(isoStr) {
  // "2024-01-15 10:30:00" or "2024-01-15T10:30:00" → "20240115T103000Z"
  // D1 stores datetime('now') as UTC, so we append Z for RFC 5545 compliance
  if (!isoStr) return '';
  return isoStr.replace(/[-:]/g, '').replace(' ', 'T').substring(0, 15) + 'Z';
}

function buildICal(events, domain, siteName, tz) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${icalEscape(siteName)}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icalEscape(siteName)}`,
    `X-WR-CALDESC:Events from ${icalEscape(siteName)}`,
  ];

  if (tz) {
    lines.push(`X-WR-TIMEZONE:${tz}`);
  }

  for (const event of events) {
    const dtstart = formatDate(event.date, event.start_time);

    let dtend;
    if (dtstart.isAllDay) {
      dtend = { value: nextDay(event.date), isAllDay: true };
    } else if (event.end_time) {
      dtend = formatDate(event.date, event.end_time);
    } else {
      dtend = formatDate(event.date, addOneHour(event.start_time));
    }

    const uid = `event-${event.id}@${domain}`;
    const dtstamp = toICalTimestampUTC(event.created_at);
    const lastMod = toICalTimestampUTC(event.updated_at);
    const appUrl = `https://${domain}/events/${event.id}`;
    const url = event.website_url || appUrl;

    // Build description: event link first (visible before truncation), then body, then reg notice
    const descParts = [];
    descParts.push(url);
    if (event.reg_required) {
      descParts.push(event.reg_link
        ? `⚠️ Registration required: ${event.reg_link}`
        : '⚠️ Registration required.');
    }
    if (event.description) descParts.push(event.description);
    const description = descParts.join('\n\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    if (dtstamp) lines.push(`DTSTAMP:${dtstamp}`);
    if (dtstart.isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${dtstart.value}`);
      lines.push(`DTEND;VALUE=DATE:${dtend.value}`);
    } else if (tz) {
      lines.push(`DTSTART;TZID=${tz}:${dtstart.value}`);
      lines.push(`DTEND;TZID=${tz}:${dtend.value}`);
    } else {
      lines.push(`DTSTART:${dtstart.value}`);
      lines.push(`DTEND:${dtend.value}`);
    }
    lines.push(`SUMMARY:${icalEscape(event.title)}`);
    if (event.address) lines.push(`LOCATION:${icalEscape(event.address)}`);
    lines.push(`DESCRIPTION:${icalEscape(description)}`);
    lines.push(`URL:${url}`);
    if (lastMod) lines.push(`LAST-MODIFIED:${lastMod}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n');
}

export async function onRequestGet(context) {
  const db = context.env.RESIST_DB;
  const reqUrl = new URL(context.request.url);

  // Validate optional ?tz= query param (IANA timezone name e.g. "America/New_York")
  let tz = null;
  const tzParam = reqUrl.searchParams.get('tz');
  if (tzParam) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tzParam });
      tz = tzParam;
    } catch (_) {
      // Invalid timezone — fall back to floating time
    }
  }

  const { results: configRows } = await db.prepare(
    "SELECT key, value FROM site_config WHERE key IN ('domain', 'site_name')"
  ).all();

  const config = {};
  for (const row of configRows) {
    config[row.key] = row.value;
  }

  const domain = config.domain || 'localhost';
  const siteName = config.site_name || 'Resist Events';

  const { results: events } = await db.prepare(
    `SELECT e.id, e.title, e.description, e.date, e.start_time, e.end_time,
            e.address, e.website_url, e.reg_required, e.reg_link,
            e.created_at, e.updated_at
     FROM events e
     WHERE e.status = 'published'
     ORDER BY e.date ASC, e.start_time ASC`
  ).all();

  const ical = buildICal(events, domain, siteName, tz);

  return new Response(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="events.ics"',
      'Cache-Control': 'no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
