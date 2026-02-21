# Resist Events

A community event coordination platform for activist organizations, built entirely on Cloudflare.

Resist Events gives local coalitions a shared space to post, coordinate, and promote civic actions — marches, protests, community gatherings, signature drives, direct actions, whatever you're organizing. It's designed to be run by a city or regional group of community organizers, with member organizations submitting their own events for review and publication.

The whole thing runs on Cloudflare. Free tier covers most deployments, there's **nothing to self-host**, and the infrastructure is hardened against the kind of targeted attacks and traffic spikes that activist sites tend to attract. If your coalition qualifies for [Project Galileo](https://www.cloudflare.com/galileo/), you get enterprise-level DDoS protection and firewall rules on top of that, at no cost.

This project was **not sponsored by Cloudflare in any way**. We just appreciate their easy to use platform and free tier offerings.

---

## Not interested in reading a boring list of features?

**Live instance:** [cityresist.events](https://cityresist.events)

Have some fun! Hit all of the buttons you like. Create some events, make some stuff up! Create some organizations, add some users, check out how they appear on the calendar. We have built in the ability to wipe and reseed the database as often a we like - Use the **Demo Mode** switcher up top and select **Admin**, then click the orange **Admin** button in the top right. Select **Site Settings**, then scroll to the bottom and hit **Wipe and Re-Seed Database**. This will remove all data and changes that you entered. This demo instance re-seeds itself every 24 hours automatically too.

---

## Boring Feature List Time!

### Public calendar

The public-facing side is a shared calendar that anyone can browse — no account required. Events are displayed in an agenda view by default (browseable week by week) with a full month view as an alternative. Every event has its own detail page with the full info: location, time, what to bring, what not to bring, the hosting organization, and any links or other details the organizer wishes to share.

<!-- screenshot: public calendar / agenda view -->
<img width="2294" height="2159" alt="Public Calendar / Agenda View" src="https://github.com/user-attachments/assets/9a79d99b-7753-47e0-acc7-950a8ca3623e" />

<!-- screenshot: event detail -->
<img width="1149" height="1303" alt="Event Detail" src="https://github.com/user-attachments/assets/8c017309-3ea4-43b1-b4fc-d659215715dc" />


The organizations page lists all participating groups with search and city filtering. Each org has its own profile with their mission, website, social links, and upcoming events.

<!-- screenshot: organizations page -->
<img width="2300" height="1422" alt="Organizations Page" src="https://github.com/user-attachments/assets/5effffbd-828d-4559-8a8f-92d74846068d" />

The homepage shows live stats — upcoming event count, number of participating organizations, and total people mobilized — all pulled dynamically from the database and configurable from the admin panel.

<img width="2300" height="1422" alt="Home Page" src="https://github.com/user-attachments/assets/28879313-3e9b-4aec-91ea-e22afee70630" />


### For organizers

Member organizations get a login to submit and manage their own events. Submitted events go into an admin review queue before going live (if they choose, or can be auto approved). Organizers can see the status of everything they've submitted, edit drafts, and message site admins through a built-in messaging system.

<img width="2300" height="906" alt="My Events" src="https://github.com/user-attachments/assets/9de61afd-b33d-4bdc-b008-ac75ba92ad7d" />

The submission form covers all the basics: title, date/time, location, event type, description, items to bring/avoid, and an optional external flyer URL. 

<!-- screenshot: event submission form -->
<img width="2300" height="1644" alt="Event Submission Form" src="https://github.com/user-attachments/assets/3d372c67-b026-4b71-b8db-1b01eca9389b" />

**Flyer generation** lets organizers create print-ready or shareable flyers directly from a submitted event — no design tools required. There are four templates to choose from:

- **The Broadside** — newspaper/poster aesthetic
- **Rally Bold** — high-energy protest style
- **Modern Clean** — minimal and contemporary
- **People's Voice** — grassroots community feel

<img width="1198" height="1848" alt="Flyer Templates" src="https://github.com/user-attachments/assets/bf438c8c-2605-4fd1-833a-7385d965177b" />

Each template auto-generates illustrations and color schemes based on event type (march, protest, community gathering, signature drive, virtual). Generated flyers are stored in R2 (Cloudflare Storage) and auto-delete after a configurable number of days post-event. Organizers can also download their flyer directly or delete it and regenerate with a different template.

<!-- screenshot: generated flyer examples -->
<img width="894" height="1420" alt="Flyer Generation Preview" src="https://github.com/user-attachments/assets/aa7e9592-86f8-4288-8ad4-68f2bed9e38f" />

Sample Flyer in PNG format, standard size 1080x1440:

<img width="1080" height="1440" alt="image" src="https://github.com/user-attachments/assets/767f5dc5-630c-4039-ac30-213af9e4c4ce" />


Organizers can also copy event details as plain text or Markdown for sharing in newsletters, social posts, Reddit, or Signal groups.

<img width="1042" height="300" alt="Markdown Export" src="https://github.com/user-attachments/assets/43940b71-4ee6-4fe4-9d2e-677be107fea3" />


### Admin panel

The admin panel is a full management interface organized around a vertical sidebar navigation with a collapsible right-side drawer.

**Review Queue** — submitted events land here for approval or rejection. Admins can review event details inline and message organizers directly from the queue if something needs clarification. Optional!

**Manage Organizations** — create, edit, and remove member organizations. Control which organizations organizers are allowed to submit events for (own org only, approved list, or any org).

**Manage Users** — create and manage user accounts with filtering by organization. Users have one of three roles: Guest (read-only), Organizer (create/edit events, message admins), or Admin (full access).

**Event Settings** — configure organizer publishing permissions sitewide.

**Admin Messages** — a unified inbox for all organization and direct message threads, with archiving and unread indicators.

<!-- screenshot: admin panel -->

<img width="444" height="648" alt="Admin Panel" src="https://github.com/user-attachments/assets/a31affbe-dabe-4d41-95a0-7040423cc0df" />

<!-- screenshot: review queue -->

<img width="2004" height="492" alt="Admin Queue" src="https://github.com/user-attachments/assets/aed00cf4-012c-4746-8e55-bdb6e47d1088" />


### Site Settings & Homepage Settings

Everything about how the site presents itself is configurable without touching code. Site name, city/region prefix, hero text, homepage stats display, purpose statement, privacy policy, terms of service, copyright footer — all editable from the admin panel. Changes take effect immediately.

<!-- screenshot: site settings -->
<img width="2004" height="2038" alt="Site Settings" src="https://github.com/user-attachments/assets/7551fb39-0d8a-4190-a96f-98138a4d6886" />

### Setup Wizard

Fresh deployments start with a guided setup wizard. Choose between **Demo Mode** (loads Camelot-themed sample data, can be wiped and re-seeded anytime) or **Live Mode** (for real deployments). Live Mode setup asks for site name, admin email, city, and admin group name. When finished, it hands you off to Cloudflare Access for authentication.

### Demo Mode

Demo Mode lets anyone explore the full platform without touching real data. Pick a role on arrival — Guest, Organizer, or Admin — and the UI adjusts accordingly. The demo database can be wiped and re-seeded from the admin panel at any time. When you're ready to go live, there's a one-step "Disable Demo Mode & Wipe Database" flow that clears the demo data and switches the site to production auth.

<!-- screenshot: demo mode role picker -->
<img width="586" height="96" alt="Setup Wizard" src="https://github.com/user-attachments/assets/9cbecee1-4190-4c0f-9b8e-88eb4cfb481b" />

### Backup & Restore

The Database Settings panel has a robust backup and restore system. Backups are AES-256-GCM encrypted, selectable by table (events, organizations, users, messages, or full), and stored in Cloudflare R2. Restores support both overwrite and merge modes. There's also a **Schedules** tab that generates a complete Cloudflare Worker + `wrangler.toml` for automated scheduled backups with configurable retention periods.

A **Clean Up** tab lets admins archive or permanently delete old data — expired events, old messages — with configurable auto-delete thresholds. A **Reset DB** tab handles full or selective database resets for development and testing.

<!-- screenshot: database settings -->
<img width="2518" height="1182" alt="Restore" src="https://github.com/user-attachments/assets/6ae71e2d-9c8e-43e6-8e4a-b00d3a55b352" />

---

## Installation

See the [Installation Guide](../../wiki/Installation-Guide) for full deployment instructions. The short version: fork the repo, connect to Cloudflare Pages, create a D1 database, run the schema migration, and the Setup Wizard handles the rest.

---

## Built on Cloudflare

Resist Events was built to run run entirely on Cloudflare's infrastructure:
 * **Pages** for hosting
 * **Secrets** for sensitive data
 * **Cloudflare One** for:
   * Access Control
   * Identity Provider Management and enrollment
   * Zero Trust Authentication for site admins and organizers
   * DDOS Protection
 * **E-Mail Routing** for making e-mail redirects (admin@cityresist.events --> personal@gmail.com)
 * **D1** for the database
 * **R2** for flyer storage

### You do not need to write a single line of code to get started!

### Project Galileo

If your coalition does civil liberties work, human rights advocacy, or activist organizing, apply for [Project Galileo](https://www.cloudflare.com/galileo/) — Cloudflare's program that provides enterprise-grade security to vulnerable organizations at no cost. Activist infrastructure gets targeted. This program exists specifically for that.

---

## Tech stack

- **Frontend:** Vanilla JS SPA, no framework, no build step
- **Backend:** Cloudflare Pages Functions (file-based routing under `/functions/api/`)
- **Database:** Cloudflare D1 (SQLite-compatible)
- **Storage:** Cloudflare R2 for flyers and backups
- **Auth:** Cloudflare Access (JWT-based, live mode) / cookie-based role selection (demo mode)

---

## License

GPL-3.0 — fork it, deploy it for your city, adapt it for your coalition. See [SPEC.md](./SPEC.md) for architecture details.

