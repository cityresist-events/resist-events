// POST /api/demo/reseed — wipe all data and re-insert default seed data

export async function onRequestPost(context) {
  const db = context.env.RESIST_DB;

  try {
    // Verify app is in demo mode
    const modeRow = await db.prepare("SELECT value FROM site_config WHERE key = 'app_mode'").first();
    if (!modeRow || modeRow.value !== 'demo') {
      return Response.json({ error: 'App is not in demo mode' }, { status: 400 });
    }

    // Wipe all tables (order matters for FK constraints)
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

    // Re-insert seed data: site_config
    await db.batch([
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('app_mode', 'demo'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('demo_admin_email', 'dev@localhost'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('site_name', 'Camelot Resist Events'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('site_region', 'Camelot'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('domain', 'cityresist.events'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('archive_retention_months', '12'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('flyer_auto_delete_days', '30'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('event_organizer_permission', 'own_org_only'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('hero_line_1', 'Together We'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('hero_line_2', 'Show Up.'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('hero_subtitle', 'One calendar for every rally, march, meeting, and action. Find your people. Make your voice heard.'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('show_event_count', 'yes'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('show_org_count', 'yes'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('show_people_mobilized', 'yes'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('show_github_link', 'yes'),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('copyright_text', '2026 Camelot Resist Events \u00b7 Open source and community-driven'),
    ]);

    // site_config: longer text fields
    await db.batch([
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('privacy_policy', `
<p><strong>Last updated:</strong> February 2026</p>
<p style="margin-top:12px;">Resist Events is an open-source community event calendar. We are committed to transparency about how this application works.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Information We Collect</h4>
<p>This demo instance uses browser cookies solely for demo session management (role selection). No personal data is collected, stored, or shared beyond what you voluntarily enter into the application (event details, organization info, messages).</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Data Storage</h4>
<p>All data is stored in a Cloudflare D1 database associated with this deployment. In demo mode, data may be periodically reset. Archived events and messages are automatically deleted after the configured retention period.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Third-Party Services</h4>
<p>This application uses Cloudflare Pages for hosting and Cloudflare D1 for data storage. No third-party analytics, tracking, or advertising services are used.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Open Source</h4>
<p>The source code for this application is publicly available. You can review exactly what data is collected and how it is handled by inspecting the codebase.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Contact</h4>
<p>If you have questions about this privacy policy, please use the Messages feature to contact the site administrators.</p>
`),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('terms_of_service', `
<p><strong>Last updated:</strong> February 2026</p>
<p style="margin-top:12px;">By using Resist Events, you agree to the following terms.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Purpose</h4>
<p>Resist Events is a community-driven event calendar designed to help local organizations coordinate civic actions, rallies, meetings, and community events. The platform is provided as-is for community benefit.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">User Conduct</h4>
<p>Users agree to submit only truthful event information, refrain from posting harmful or misleading content, and respect the community guidelines set by site administrators. Events promoting violence or illegal activity are strictly prohibited.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Content Moderation</h4>
<p>All submitted events are subject to review and approval by site administrators. Administrators reserve the right to reject, modify, or remove any content that violates these terms or community guidelines.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Disclaimer</h4>
<p>This platform is provided "as is" without warranty of any kind. The operators are not responsible for the accuracy of event information submitted by organizers, nor for any outcomes resulting from attendance at listed events.</p>
<h4 style="margin-top:16px;color:var(--text);font-size:14px;">Open Source</h4>
<p>This software is open source. You are free to fork, modify, and deploy your own instance in accordance with the project's license.</p>
`),
      db.prepare("INSERT INTO site_config (key, value) VALUES (?, ?)").bind('purpose_text', `
<p style="margin-bottom: 16px; line-height: 1.7;">
  Listen. Strange women lying in ponds distributing swords is no basis for a system of government. Supreme executive power derives from a mandate from the masses, not from some farcical aquatic ceremony.
</p>
<p style="margin-bottom: 16px; line-height: 1.7;">
  We built <strong>Camelot Resist Events</strong> because there are many organizations throughout the realm that hold events, rallies, quests, and peasant uprisings. Finding these events can be challenging \u2014 each organization uses different communication channels, from carrier pigeons to town criers to enchanted scrolls.
</p>
<p style="margin-bottom: 16px; line-height: 1.7;">
  Our goal is to create a single, unified event calendar for the community. We want to make civic engagement as easy as possible by removing barriers to finding out what's happening and when.
</p>
<p style="line-height: 1.7;">
  This project is <strong>open source</strong> and community-driven. If your organization would like to participate, hit the <em>Contact Us</em> button to get started. You don't have to be oppressed to join \u2014 but it helps.
</p>
`),
    ]);

    // Organizations
    await db.batch([
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(1, 'Knights of the Round Table', 'KRT', 'https://roundtable.camelot', '{"fb":"https://facebook.com/roundtable","ig":"https://instagram.com/knightsrt"}', 'Camelot', 'Defending the realm through chivalry, justice, and the quest for the Holy Grail.'),
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(2, "Peasants' Autonomous Collective", 'PAC', 'https://peasants-collective.camelot', '{"fb":"https://facebook.com/peasants","rd":"https://reddit.com/r/peasants"}', 'Muddy Village', 'An anarcho-syndicalist commune demanding fair representation and peasant rights.'),
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(3, 'Knights Who Say Ni', 'NI', null, '{"x":"https://x.com/knightswhosyni"}', 'Forest of Ni', 'Protecting the sacred forests and demanding shrubberies for environmental justice.'),
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(4, "Camelot Women's Guild", 'CWG', 'https://womensguild.camelot', '{"ig":"https://instagram.com/cwg"}', 'Camelot', 'Empowering women across the realm through education, advocacy, and community action.'),
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(5, 'Holy Hand Grenade Society', 'HHGS', null, '{}', 'Camelot', 'Promoting safe handling of holy relics and proper counting techniques since 932 AD.'),
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(6, 'Swamp Castle Progressives', 'SCP', 'https://swampcastle.camelot', '{"fb":"https://facebook.com/swampcastle"}', 'Swamp Castle', "Building a better future on solid ground \u2014 or at least trying to stop sinking."),
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(7, 'Ministry of Silly Walks', 'MSW', 'https://sillywalks.gov.camelot', '{"ig":"https://instagram.com/sillywalks","x":"https://x.com/sillywalks"}', 'Camelot', 'Advancing pedestrian creativity and securing government funding for silly walks.'),
      db.prepare("INSERT INTO organizations (id, name, abbreviation, website, socials, city, mission_statement) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(8, 'Dead Parrot Advocacy League', 'DPAL', null, '{"rd":"https://reddit.com/r/deadparrot"}', 'Stinking Fen', 'Fighting for consumer rights and truth in pet shop advertising.'),
    ]);

    // Users
    await db.batch([
      db.prepare("INSERT INTO users (id, email, display_name, role, org_id) VALUES (?, ?, ?, ?, ?)").bind(1, 'admin@camelot-resist.events', 'Arthur Pendragon', 'admin', 1),
      db.prepare("INSERT INTO users (id, email, display_name, role, org_id) VALUES (?, ?, ?, ?, ?)").bind(2, 'dennis@peasants.camelot', 'Dennis the Peasant', 'organizer', 2),
      db.prepare("INSERT INTO users (id, email, display_name, role, org_id) VALUES (?, ?, ?, ?, ?)").bind(3, 'guest@camelot-resist.events', 'Brave Sir Robin', 'guest', null),
    ]);

    // User-Org memberships
    await db.batch([
      db.prepare("INSERT INTO user_orgs (user_id, org_id, status) VALUES (?, ?, ?)").bind(1, 1, 'active'),
      db.prepare("INSERT INTO user_orgs (user_id, org_id, status) VALUES (?, ?, ?)").bind(2, 2, 'active'),
    ]);

    // Reset autoincrement sequences
    await db.batch([
      db.prepare("DELETE FROM sqlite_sequence"),
    ]);

    // Events
    await db.batch([
      db.prepare("INSERT INTO events (id, title, org_id, date, start_time, end_time, address, description, status, bring_items, no_bring_items, notes, reg_required, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(1, 'Rally for Peasant Representation', 2, '2026-02-14', '10:00 AM', '1:00 PM', 'Town Square, Muddy Village, Camelot',
          'Join us at the Town Square to demand fair representation in governance. We are an anarcho-syndicalist commune! We take it in turns to act as a sort of executive officer for the week. All decisions must be ratified at a special bi-weekly meeting.',
          'published', '["Protest Signs","Water","Mud-resistant Boots"]', '["Holy Hand Grenades","Shrubberies"]',
          'Dennis will lead the opening remarks. Come prepared to discuss the violence inherent in the system.', 0, 'protest_gathering'),
      db.prepare("INSERT INTO events (id, title, org_id, date, start_time, end_time, address, description, status, bring_items, no_bring_items, notes, reg_required, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(2, 'Town Hall: Bridge Toll Policy', 1, '2026-02-15', '6:00 PM', '8:30 PM', 'Castle Camelot, Great Hall, Camelot',
          "An open town hall to discuss the controversial bridge-crossing policies. Must you answer three questions to cross? What if you don't know the airspeed velocity of an unladen swallow?",
          'published', '["Water"]', '["Holy Hand Grenades"]',
          'Refreshments provided. Swallows (African and European) welcome.', 1, 'community_event'),
      db.prepare("INSERT INTO events (id, title, org_id, date, start_time, end_time, address, description, status, bring_items, no_bring_items, notes, reg_required, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(3, 'Shrubbery Planting Volunteer Day', 3, '2026-02-16', '9:00 AM', '4:00 PM', 'Forest of Ni, Eastern Camelot',
          'The Knights Who Say Ni require a shrubbery! Join us for a community planting day. We need volunteers to create a nice two-level effect with a little path running down the middle.',
          'published', '["Gardening Gloves","Sunscreen","Water","Comfortable Shoes"]', '[]',
          'Do NOT say "it" \u2014 you know the word. Bring your own shrubbery if you have one.', 0, 'community_event'),
      db.prepare("INSERT INTO events (id, title, org_id, date, start_time, end_time, address, description, status, bring_items, no_bring_items, notes, reg_required, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(4, 'March for Swallow Research Funding', 4, '2026-02-22', '11:00 AM', '2:00 PM', 'Castle Courtyard, Camelot',
          'March through Camelot in support of increased funding for swallow migration research. Are they African or European? We need answers!',
          'published', '["Sunscreen","Water","Protest Signs","Hat / Sun Shade"]', '["Coconut Halves (they attract swallows)","Holy Hand Grenades"]',
          'Meet at the Castle Courtyard. March route is 1.5 leagues, flat terrain through the village.', 0, 'march'),
      db.prepare("INSERT INTO events (id, title, org_id, date, start_time, end_time, address, description, status, bring_items, no_bring_items, notes, reg_required, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(5, 'Holy Hand Grenade Safety Workshop', 5, '2026-02-28', '7:00 PM', '9:00 PM', "Brother Maynard's Chapel, Camelot",
          'Learn the proper counting technique for the Holy Hand Grenade of Antioch. Remember: "Three shall be the number thou shalt count, and the number of the counting shall be three."',
          'published', '[]', '["Live Rabbits"]',
          'Light refreshments provided. The Book of Armaments will be available for reference.', 0, 'community_event'),
      db.prepare("INSERT INTO events (id, title, org_id, date, start_time, end_time, address, description, status, bring_items, no_bring_items, notes, reg_required, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(6, 'Know Your Rights: Witch Trial Defense', 2, '2026-03-05', '6:00 PM', '8:00 PM', "Peasants' Meeting Hall, Muddy Village, Camelot",
          "Learn your rights if accused of being a witch. Does she weigh the same as a duck? Is that really a valid legal test? Legal experts from the Peasants' Autonomous Collective will present.",
          'review', '[]', '[]',
          'Scales and ducks will NOT be provided. This is an educational seminar.', 1, 'community_event'),
      db.prepare("INSERT INTO events (id, title, org_id, date, start_time, end_time, address, description, status, bring_items, no_bring_items, notes, reg_required, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(7, 'Spring Coconut Migration Census', 1, '2026-03-12', '9:00 AM', '12:00 PM', '',
          'Help us count the coconut-carrying swallows on their spring migration. Are they gripping them by the husk? Training provided for new volunteers.',
          'draft', '["Water","Comfortable Shoes","Binoculars"]', '[]',
          'Location will be shared upon registration. It could be carried by an African swallow!', 1, 'virtual'),
    ]);

    // Messages
    await db.batch([
      db.prepare("INSERT INTO messages (id, topic, org_id, event_id, archived, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(1, 'Re: Know Your Rights: Witch Trial Defense', 2, 6, 0, '2026-02-10 14:15:00'),
      db.prepare("INSERT INTO messages (id, topic, org_id, event_id, archived, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(2, 'Request to bring coconuts to rally', 2, null, 0, '2026-02-05 10:20:00'),
    ]);

    // Message replies
    await db.batch([
      db.prepare("INSERT INTO message_replies (message_id, from_type, text, created_at) VALUES (?, ?, ?, ?)")
        .bind(1, 'org', "How long does event approval typically take? I submitted the \"Know Your Rights: Witch Trial Defense\" event 3 days ago. Help! Help! I'm being repressed!", '2026-02-10 14:15:00'),
      db.prepare("INSERT INTO message_replies (message_id, from_type, text, created_at) VALUES (?, ?, ?, ?)")
        .bind(1, 'admin', "Calm down, Dennis. Approvals usually take 24-48 hours. Let me check on yours \u2014 which event is it?", '2026-02-10 16:30:00'),
      db.prepare("INSERT INTO message_replies (message_id, from_type, text, created_at) VALUES (?, ?, ?, ?)")
        .bind(1, 'org', "It's the witch trial defense workshop. You saw me being repressed, didn't you? Come and see the violence inherent in the system!", '2026-02-11 09:00:00'),
      db.prepare("INSERT INTO message_replies (message_id, from_type, text, created_at) VALUES (?, ?, ?, ?)")
        .bind(1, 'admin', "Found it. It's in the review queue. I'll prioritize it \u2014 you should see it approved by end of day. And Dennis, you're not being repressed.", '2026-02-11 15:42:00'),
      db.prepare("INSERT INTO message_replies (message_id, from_type, text, created_at) VALUES (?, ?, ?, ?)")
        .bind(2, 'org', 'Can we bring coconut halves to the Rally for Peasant Representation? We need them for horse sound effects during the march.', '2026-02-05 10:20:00'),
    ]);

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
