# Table Talks Australia — Context

## What Table Talks is

Table Talks is a Melbourne-based hospitality/experience studio founded by **Samantha Perion**. It designs "social architecture" — spatial brand activations that blend hospitality, design and storytelling — for brands, venues and cultural institutions. Registered office: Level 14/330 Collins Street, Melbourne VIC 3000.

Core positioning line: *"Redefining the way we gather."* Extended line: *"Redefining Melbourne's culinary culture and connecting curious minds through curated experiences — encouraging you to live boldly and with an open mind."*

## Mission / philosophy

"We make cool concepts and bring them to life." Through architecture, cultural programming and hospitality, spaces become living platforms where people, culture and place intersect. Five value pillars (as stated on /about):

1. **Connection & Soul** — every gathering is designed to foster connection with people, space, partners, brands and the city
2. **Intentional Design** — every detail, from experience to table setting to conversation, is curated with purpose
3. **Integrity in Craft** — honouring the craftsmanship behind produce, dishes, service and hospitality
4. **Depth over Scale** — resonance over reach; lasting connections over one-off transactions
5. **Cultural Contribution** — collaborating with chefs, artisans and creative partners to shape Melbourne's cultural identity

The homepage states a shorter 4-pillar variant of the same idea: **Social Architecture**, **Story**, **Heritage**, **Nature**.

## Sub-initiatives / product lines

Table Talks operates two adjacent programs, both referenced sitewide in the footer and both mid-build:

- **Service Rewritten** — an experiential dinner series reframing hospitality as connection rather than transaction; open-air events in iconic Melbourne locations celebrating chefs, producers and artisans.
- **Made by Many (by Table Talks)** — a separate community/expedition platform, currently centred on **"Mission 1: Siargao"** (Philippines) — a documentary-style expedition preserving unwritten local recipes, stories and traditions, funded via a public-ledger transparency model ("We don't want your money. We want your participation."). This lives at `/missions` and is a distinct "waitlist" template with its own header/footer (nav says "Articles" not "Journals", CTA says "Join Mission 1" not "Join mission 001", footer blurb says "across the world" not "across Siargao", and the footer's Contact/Join/Feedback/Careers links are unbuilt `./` placeholders on the live site itself — reproduced as-is). It is still visibly **work-in-progress**: the "Co-create extraordinary things..." partners row is seven literal `[Insert logo]` placeholders on the live site, and the "Missions across the island" profile cards use a solid colour swatch instead of real portraits. Treat this section as "coming soon" content, not finished copy — don't polish it into something it isn't yet. One deliberate addition: the animated dashed-route SVG map (Siargao island loop) is our own enhancement layered on top of the live site's plainer static map graphic — kept intentionally, not meant to be reverted for 1:1 parity.

## Content/editorial arm

"Journals" is the site's editorial section — long-form pieces under the Table Talks voice, e.g. *"Service Rewritten: Redefining the way we dine"* and *"The Greatest Lie We Were Ever Sold Was That We Were Meant to Stand Alone"* (an essay on interdependence vs. individualism as an economic/social idea). There's also an "Archives" template for individual event case studies (e.g. the NON5 Lemon Marmalade & Hibiscus launch with NON World in Fitzroy Gardens), showing sponsor logos, event category tags and photography.

**Note on unpublished routes**: the sitemap also lists `/old-home`, `/journals` and `/journals/the-tables-we-set` — these currently render as empty Framer shells (no real content, confirmed byte-identical). They are **not** rebuilt here. `/archives/royal-exhibition-building` and `/archives/aster-bar-x-masterchef-david-tan` were also empty at the initial scrape but were published shortly after and have since been added, alongside `/archives/non5`, as the three live examples of the archive case-study template.

## Contacts

- General inquiries: `info@tabletalksaustralia.com.au`
- Private events / Press: `business@samanthaperion.com`
- Instagram: `instagram.com/tabletalksau`
- Careers form (Google Form, live link, kept as-is): `https://docs.google.com/forms/d/e/1FAIpQLSecKuMrZ8sf21AB_Iwuan2M3TIMk5S3AVaWtD5doBTyo2cFKQ/viewform`

## Why this project exists

The live site is built in Framer, which the client (you) found painful to work in ("the most shitty website builder I've encountered"). The brief: preserve the visual style, imagery, UX and content exactly as they are today, but rebuild the site as a plain, portable static site (HTML/CSS/JS) outside Framer, so it's easier to maintain going forward. See `DA.md` for the extracted design system and `ARCHITECTURE.md` for the page-by-page content/section map used to rebuild it.
