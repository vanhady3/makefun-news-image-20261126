# Design brief — news-image-20261126

## Competition
"Sum up 26 November's world news in one image". $100 pot, 50 places
(1st $20, 2nd $12, 3rd $6, 4th–10th $2, 11th–50th $1.20).
Program: main.ts (Node, stdlib only), writes one 1024x1024 PNG (<=1 MiB) to
argv[2] or /output/entry.png. No network, no Date, no randomness: every
coordinate and colour is fixed, so two runs are byte-identical.
Judge: AI picture editor, pairwise; image must NAME the day (26 November 2026),
show the day's most consequential stories across regions/fields, read clearly,
stay faithful to reported facts, one clean composition, legible at ~300px.
Entries close Sat 28 Nov 07:00 WIB (2026-11-28T00:00:00Z). Only 2 submissions
in at ~07:07 WIB on 26 Nov — submit today, do not wait for the deadline.

## USER DIRECTION (standing, 24 Nov 07:42 WIB)
Make it AS ATTRACTIVE AS POSSIBLE — news AND image, no sloppiness. Pick the
BIGGEST, MOST VISUAL stories that read straight from the picture. Strong
composition, clear subject, good contrast, tidy visual hierarchy, LITTLE text,
BIG and readable. The image must stand out at first glance against hundreds
of others. Critically inspect the result and fix anything messy, cut off, or
slapped together before finishing.

## Verified stories (live search, 26 Nov 2026 ~07:10 WIB)
1. LEAD — YEMEN WAR ESCALATES: Houthis claim 83 people were killed and
   about 50 wounded in Saudi-led coalition airstrikes across Yemen in the
   past 24 hours. Saudi Arabia says it is reviewing reports of civilian
   deaths. Separately, local officials told AFP a strike on buses and trucks
   in Lahj province on Monday killed 26 (12 fighters, 14 civilians), and
   Houthi sources say 17 were killed in Hodeida strikes. The UN says more
   than 1,600 people have been killed and over 300,000 displaced since
   fighting resumed. Casualty figures are Houthi claims, NOT independently
   verified — say so in the image.
2. UKRAINE HITS FIVE RUSSIAN JETS: Kyiv's General Staff says its forces
   damaged five Russian military aircraft at Savasleyka airfield, 300 km
   east of Moscow, overnight 24–25 Nov: three MiG-31s (Kinzhal missile
   carriers) and two Su-34s, grounded "for some time". Kyiv also says it hit
   two oil refineries in Russia's Samara region. Claim NOT independently
   verified.
3. 5.6 QUAKE SHAKES NEPAL: A 5.6-magnitude earthquake struck Nepal's Koshi
   Province, near the Chinese border.
4. PAKISTAN'S FIRST ASTRONAUT: Muhammad Zeeshan Ali becomes Pakistan's
   first astronaut, selected to fly to China's Tiangong space station aboard
   Shenzhou-24.
5. FOOTER BRIEFS: South Africa's Ramaphosa wins a reprieve in the Farmgate
   impeachment vote; Solomon Islands and Australia sign a landmark security
   treaty; Xi's graft probe targets a Shanghai rising star; Russia's own
   figures show nearly 500,000 war dead in Ukraine; US preparing a plan for
   new tariffs on global trading partners; South Korea's education minister
   resigns over an exam-cheating scandal; COP31 climate talks end with no
   deal.

## Layout (1024x1024, BOLD POSTER — deep charcoal-navy, ember orange, sand gold)
- Background deep charcoal-navy #0d1526 full bleed; ember frame inset 12, 4px.
- Top: "THURSDAY 26 NOVEMBER 2026" sand-gold scale 3 centred (y36), thin
  gold rules either side. The day is named big and first.
- HERO panel x28..996 y84..600, lighter panel #16233c, steel frame:
  headline "YEMEN: 83 KILLED / IN 24 HOURS OF STRIKES" white scale 7 centred
  (two lines, y104); subhead gold scale 2 "HOUTHIS BLAME SAUDI-LED
  COALITION — RIYADH REVIEWING CIVILIAN DEATH REPORTS" (y196); stat line
  ember-orange scale 2 "50 WOUNDED | UN: 1,600+ DEAD, 300,000+ DISPLACED"
  (y224); illustration: two warplanes crossing a dusk sky above a city
  skyline, grey smoke columns rising, orange blast bursts, rubble at the
  base; one body line scale 1 centred (y572): "CASUALTY FIGURES ARE HOUTHI
  CLAIMS — NOT INDEPENDENTLY VERIFIED".
- Gold divider y618.
- BOTTOM ROW y640..940, three panels w304 (x28 / 360 / 692), lighter panel,
  steel frame: kicker gold scale 1, headline white scale 3 centred (2-3 lines),
  ONE clear illustration each, one body line scale 1:
  1. JETS "FIVE RUSSIAN JETS / HIT AT AIRFIELD" — airfield tarmac at dusk,
     five jet silhouettes in a row, one with an orange blast; body
     "3 MIG-31 KINZHAL CARRIERS + 2 SU-34 — KYIV CLAIMS".
  2. QUAKE "5.6 QUAKE / SHAKES NEPAL" — mountain range, cracked ground,
     seismograph zigzag line; body "KOSHI PROVINCE, NEAR CHINA BORDER".
  3. SPACE "PAKISTAN'S FIRST / ASTRONAUT" — rocket rising past a space
     station, stars, small crescent; body "ZEESHAN ALI TO FLY TO TIANGONG".
- FOOTER y958..1000, small grey scale 1 centred, two lines max:
  "RAMAPHOSA WINS FARMGATE REPRIEVE • SOLOMON ISLANDS–AUSTRALIA SECURITY PACT
  • XI GRAFT PROBE HITS SHANGHAI STAR • RUSSIA: ~500,000 WAR DEAD, OWN FIGURES
  • US READIES NEW TARIFFS • COP31: NO DEAL"

## Build rules (authorship gate — read carefully)
- Write main.ts FRESH from this brief only. NEVER read any other entry's
  main.ts, and NEVER read the kit starter's main.ts — a transcribed file
  counts as copied even renamed/reformatted.
- First command in the fresh repo dir, BEFORE writing anything:
  node ~/workspace/makefun/news-image-20261126-kit/news-image-20261126-kit/cli/makefun.mjs init --license MIT --keypair ~/workspace/makefun/makefun-keypair.json
  Quote the anchor/drand line it prints in your final report. The anchor
  must come before your first counted write.
- Repo: ~/workspace/makefun/news-image-20261126 (create it). GitHub public
  repo vanhady3/makefun-news-image-20261126 (gh CLI, already logged in).
  LICENSE MIT (copy the kit starter LICENSE file), README with badges +
  referral link https://make.fun/r/6yqrkbx0, repo About topics:
  make-fun, news-image, typescript, nodejs.
- Commits in this order: (1) anchor root — .makefun/freshness.json only;
  (2) LICENSE: MIT; (3) main.ts + README; (4) DESIGN-BRIEF.md + out/entry.png.
  Copy this brief into the repo as DESIGN-BRIEF.md in commit (4).
- Run the program TWICE; the two out/entry.png files must be byte-identical
  (compare sha256). Verify 1024x1024 and <=1 MiB.
- VIEW the PNG yourself (read the image file) and fix anything messy, cut
  off, overlapping, or unreadable before finishing. No text may be obscured
  by illustration elements.
- Report back: repo URL, HEAD commit sha, anchor drand round, PNG sha256 +
  size, your session/agent id, and any visual fixes you made.
