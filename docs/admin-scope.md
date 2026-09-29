# SHERO Admin Dashboard — Scope

Sep 28, 2026 · @sherohq

## Overview

The admin at admin.sherohq.com is being cut from about 25 sections to 10, so it runs only what the redesigned website creates.

The old admin was built for a company with staff, campaigns and an AI hub. SHERO is run by one person, and the new site (see the SHERO Website Redesign PRD) generates a small, specific set of work: shop orders, device listings, consultation requests, product waitlists, referrals, testimonials, client work and careers. Everything in this dashboard exists to handle one of those, quickly, by one admin.

## Principles

- **Built to act, not to admire.** The home screen lists what needs doing today; metrics are secondary.
- **The dashboard enforces the site's honesty rules.** A listing can't go live without its device check; a testimonial can't be published without consent.
- **The dashboard enforces the privacy rules.** Referral numbers are deleted unless the referrer agreed to stay in touch.
- **WhatsApp Phase 1.** No API: each order or lead gives the admin a ready-to-send message and a link that opens the chat on WhatsApp.
- **Not a second Merchander.** No bookkeeping, stock management beyond listings, or multi-user operations. If SHERO needs those, that's Merchander's job.
- **One admin account,** protected by two-factor login.
- **Display name: SHERO,** matching the website (the old admin said "SHERO TECHNOLOGIES").

## The 10 sections

### 1. Dashboard

A to-do list first, numbers second.

- **Needs action:** orders to confirm, orders to pack or dispatch, new consultation requests, new waitlist signups, listings waiting for their device check, referrers to thank, testimonials waiting for consent.
- **This month:** orders, revenue, consultation requests, waitlist signups.
- Each to-do item links straight to the record.

### 2. Orders

- **Fields:** order number (SH-xxxxx), date, customer name, phone, optional email, items, delivery method (Tamale or bus), region, town, pickup station, payment method, payment status, total, referral number if given.
- **Statuses, matching the Track Order page:** Placed → Confirmed and packed → Sent to the station (or Out for delivery in Tamale) → Ready for pickup (or Delivered). Plus Cancelled.
- **Payment status:** MoMo or card paid; cash on delivery pending or collected.
- **Each status change** shows the WhatsApp message for that step, with a Copy button and an Open WhatsApp link to the customer's number.
- **Warranty end date** is set automatically: delivery date plus seven days.
- Delivery is free when the order is over the threshold in Settings.

### 3. Listings

- **Fields:** model, category, photos of the actual device, specs, price, optional note (free text, e.g. "light enough for school"), grade, status (Draft, In stock, Reserved, Sold).
- **Device check:** pass or fail for each test (screen, keyboard, trackpad, ports, speakers, camera, Wi-Fi, charging), battery health %, battery replaced (yes or no, and what type), cosmetic condition %, cleaned and reset, and the last four characters of the serial number.
- **Rule:** a listing can't be set to In stock until the device check is complete and battery health meets the Grade A++ minimum in Settings.
- Sold listings leave the shop automatically.

### 4. Consultations

- **Fields:** name, phone, optional email and business, what they need, their message, preferred contact method (call, WhatsApp, email), date.
- **Statuses:** New → Contacted → Call held → Quoted → Won or Closed.
- Private notes on each request, and an Open WhatsApp or Call link.

### 5. Waitlists

- One list each for Merchander and Pharmasyst, with the fields from each product page's form.
- **Statuses:** New → Contacted → Invited to pilot → Piloting.
- Export to CSV.

### 6. Referrals

- Created automatically when an order includes a referrer's number.
- **Steps:** Waiting for delivery → Ready to thank → Thanked (type and amount of token) → Asked to stay in touch → Kept (they agreed) or Deleted (they declined or didn't answer).
- On deletion, the phone number is erased and only a referral count stays against the order.

### 7. Testimonials

- **Fields:** quote, name or initials, business (optional), date, source (client project or shop order), linked case study or order, consent to publish (required).
- A testimonial can't be published without consent.
- The website's testimonials block appears only once at least three are published.

### 8. Work

- **Each project:** name, client, logo, one-line description, the problem, what SHERO built, the result, screenshots, live link, status, linked testimonial, display order.
- Feeds the Work page, the case study pages and the homepage client logos.

### 9. Careers

- **Each role:** title, short description, how to apply, open or closed.
- With no open roles, the site shows the "no open roles, send your CV" page; with open roles, it lists them above that message.

### 10. Settings

- **Business:** display name, contact email, phone, WhatsApp number, address, opening hours.
- **Shop:** free delivery threshold (GHS 2,000), delivery wording, payment methods, categories, Grade A++ minimum battery health.
- **Account:** profile, password, two-factor login.

## Dropped and deferred

Everything else from the old admin is either handled elsewhere, waits for Phase 2, or is removed.

| Old section | Decision | Why |
| --- | --- | --- |
| WhatsApp, Campaigns, Templates | Phase 2 | Needs the WhatsApp API; Phase 1 sends by hand from the Business app |
| Customers | Phase 2 | No accounts; order records are enough for now |
| Reviews | Later | Testimonials cover it until there are enough buyers |
| Support tickets | Dropped | Support happens on WhatsApp |
| Site Stats, most of Reports | Dropped | Google Analytics and Microsoft Clarity cover them |
| Intelligence, AI Intelligence Hub | Dropped | No clear job for one admin |
| Checkout CRM, Abandoned carts | Dropped | No accounts, and chasing unfinished checkouts needs consent |
| Team, Staff | Dropped | One admin account |
| Guides | Dropped | Not on the new site |
| Categories | Moved | Now a setting |
| Expenses, Projects | Dropped | Bookkeeping, not website admin; keeps the admin from becoming a second Merchander |

## Data and privacy

The dashboard is where the Privacy page's promises are kept, so these are built in, not left to memory.

- **Referral numbers:** deleted automatically unless marked Kept; only a count remains.
- **Customer requests:** find records by phone number, then export or delete them, to honour the "Your rights" section. Orders needed for accounting are anonymised rather than deleted.
- **Retention:** records past the periods set on the Privacy page are anonymised or deleted on a schedule.
- **Consent:** testimonials store when and how consent was given.
- **Access:** one admin account, with two-factor login and a login history.

## Open questions

**Decided**

- The GHS15.00 order was a test; clear it before launch.
- The 33 active products are real stock; each needs a device check before it's listed on the new shop.
- The admin is rebuilt alongside the new website.
- Grade A++ minimum battery health: 90%. Batteries are usually replaced with original batteries at 100%, and listings say so.

**Still open**

- [x] Resolved: thank-you tokens vary, so the site never promises a specific reward; the dashboard records what was given.
- [x] Confirm the orders period (\[6\] years) with an accountant.

### Retention periods (agreed)

| Data | Keep for | Then |
| --- | --- | --- |
| Orders and payments | \[6\] years, for tax records | Anonymise (remove name and phone, keep amounts) |
| Consultation requests | 12 months after last contact, if no work followed | Delete |
| Waitlist signups | Until 6 months after the product launches, or until they ask to leave | Delete |
| Referral numbers | Until contacted, at most 30 days after delivery | Delete unless they agreed to stay in touch |
| Testimonials | While published; consent can be withdrawn anytime | Delete on request |
| CVs (by email) | 12 months | Delete |
| Google Analytics | 14 months (the longest GA setting) | Automatic |
