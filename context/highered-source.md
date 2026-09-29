# Higher Ed homepage: source pack

**Status:** research only, for a new HE twin of `zoho-sites/homepage-sites-v5.html`. Nothing here is approved copy yet. Claims ceiling is still `context/SOURCE.md`; Jared named the HE prospectus (source 2 below) as an approved source for HE stats on 2026-09-28.

**Fetched:** 2026-09-28 (America/Denver), by a research subagent.

## Jared's decisions (2026-09-28)

- Withdrawal / dropout: use the prospectus numbers, **67% fewer withdrawals, 65% fewer dropouts**. *Dropout updated by Jared 2026-09-29: 65%, not the prospectus 66% (66% superseded).* *Withdrawal updated by Jared 2026-09-29: 67%, not the prospectus 68% (68% superseded).*
- Headline failure stat: **"up to 47% fewer failures"** in promises/CTAs; exact 47% only beside the named study with context.
- Name the study: **Utah Valley University** (14 sections, ~420 students). Same study context applies to the 64% part-time faculty figure. *Part-time faculty updated by Jared 2026-09-29: 64%, not the prospectus 65% (65% superseded for part-time faculty; 65% now means dropouts only).*
- Logos: show all four (Utah State, University of Tampa, Utah Valley University, Rutgers-Newark).
- Role word: **faculty** (not teachers / instructors).
- Keep the 72% more motivating and "Fun" findings on the HE page.
- Pull quotes: use the quotes from the HE prospectus/handout plus relevant K-12 quotes, with **generic attributions only**: "Teacher" or "Administrator" per Jared (K-12 quotes stay "Teacher", never relabeled "Faculty", so they aren't misrepresented); no names, no schools, no AI headshots. Reword "kids" to "students" only where the quote's meaning is unchanged.
- Student quotes from the HE handout keep the handout's own "Student" attribution (Jared confirmed 2026-09-28).
- Remove every parent/family reference and the In Their Own Words section.

**Punctuation note:** verbatim source text below keeps its original em dashes and emoji. Any rewrite that ships must drop the em dashes (house rule).

## Sources

| # | Source | URL | How it was read |
|---|--------|-----|-----------------|
| 1 | Live HE page (HubSpot) | https://delphi-me.com/highered (www. redirects to the same canonical) | WebFetch plus raw HTML via curl (saved: `design-loop/2026-09-28/he-prospectus/highered.html`) |
| 2 | HE prospectus | Internal prospectus tool (link held privately; not for the public repo) | A React app. All prospectus copy and stats are hardcoded in the app bundle, with an `isUniversity` flag that swaps in HE text. Extracted from the bundle, HE branch. |
| 3 | K-12 prospectus (local) | `zoho-sites/assets/Delphinium Prospectus for BYU Online High School.pdf` | The PDF has no usable text layer (glyph-coded fonts). It's a print of the same prospectus app's K-12 branch; confirmed by matching page 3 (`design-loop/2026-09-26/proof-research/prospectus-p03.png`) against the bundle's K-12 strings. |
| 4 | YouTube (@DelphiniumEngage) | https://www.youtube.com/@DelphiniumEngage | oEmbed titles and channel, watch-page durations |
| 5 | Chapman & Andrade (2024) abstract | https://link.springer.com/article/10.1007/s11423-024-10352-2 | WebFetch |

**Important about source 2:** this specific quote is a real institution's prospectus under the UEN group agreement. Its pricing is a HANDOFF hard no and is intentionally not recorded in this file. Use only the product copy and stats extracted from it.

---

## 1. Verbatim copy from delphi-me.com/highered, by section

### Audience switch (top of page)
> **My institution is...**
> [K12] KNOW MORE → `https://delphi-me.com/?hsLang=en`
> [Higher Ed] KNOW MORE → `https://delphi-me.com/highered`

The "KNOW MORE" links have empty hrefs. This is the K-12 / Higher Ed toggle Jared wants to carry over.

Header CTA: **↪ Schedule a FREE demo!** (opens a popup iframe of `https://delphi-me.com/meetings/jared381/educate`)

### Hero
> **Delphinium *Enhanced* Canvas**
> Help your students **WANT** to learn!

Hero video: "Higher Ed_ Elevate and Amplify Learning with Delphinium" (see video table). A HubSpot meetings embed (`https://delphi-me.com/meetings/jared381/educate?embed=true`) sits beside it.

> Since 2012, Dr. Jared R. Chapman (PhD, MBA, MEd) has conducted extensive research into how social connection, crystal-clear progress tracking, and playful nudges capture attention and engage students—like in athletics and the apps that keep them glued to their phones. Delphinium applies these proven techniques to education, helping students WANT to engage, not just meet deadlines. And for educators? Delphinium frees up their time, reducing the burden of emails and spotting and assisting student who need extra help! Discover how Delphinium-enhanced Canvas transforms students into confident learners!

### Logos
> ## Who's using Delphinium...?

Four logos in a slider (see the logo table).

### "Learn More About Delphinium..." (six popup cards, each with a video)

**🙋🏽‍♂️ Student Driven Engagement**
> ### Track Your Triumphs: Delphinium Style!
> Delphinium turns Canvas into a platform where students take charge of their learning journey! Colorful dashboards give them a real-time view of how far they've come and what's next on the road to success—visually reinforcing their efforts. Delphinium keeps students laser-focused and fully engaged!
>
> Whether it's the thrill of moving that progress bar closer to 100% or celebrating small wins along the way, Delphinium makes learning fun, focused, and totally student-driven. By highlighting progress, Delphinium keeps students motivated and proud of their achievements, creating a more engaging and fulfilling learning experience.

**💬 Streamlined Communication** (⚠ mentions parents; do not carry over)
> ### Delphinium: Communication Revolutionized!
> Delphinium's Community Builder is transforming communication! It's all about teamwork, making education a collaborative effort for teachers, students, and parents!
>
> With Delphinium's powerful features, teachers can quickly and easily send personalized messages to students based on their progress, celebrating successes and offering support with just a few clicks. But that's not all—Delphinium also keeps parents in the loop through progress reports and dashboards. It's like having a personal assistant, freeing up time for educators to focus on teaching and building relationships.

**🚀 Insightful Data**
> ### Success Data You Need — At a Glance
> Delphinium's 'Control Tower' makes spotting and solving engagement gaps a breeze! Teachers get a color-coded, at-a-glance view of how each student is doing—who's crushing it and who might need extra help.
>
> Delphinium's visual tools give teachers actionable insights, making it easy to step in before small issues become big problems. It's like having a digital teaching assistant that flags potential trouble and lets teachers focus on what they do best: mentoring and building a supportive learning community. The result? Teachers feel empowered, students stay engaged, and everyone wins!

**⚡️ Instant Integration**
> ### Delphinium: Clean. Consistent. Canvas.
> Transform your Canvas experience with Delphinium - the 3-minute solution for a cleaner, more consistent learning platform. Create intuitive layouts that work across all courses, reduce IT maintenance, and let teachers focus on what matters most: teaching.
>
> Say goodbye to digital confusion and hello to streamlined education where everything just makes sense. Quick to implement, simple to maintain, and designed for everyone's success.

**🏆 Effortless Gamification**
> ### Turn Homework into High Fives!
> Ready to revolutionize your class? Meet Delphinium, where learning gets a serious splash of fun! Transform your classes with colorful progress dashboards, quirky prize boxes, and personalized avatars that keep students coming back for more. Delphinium uses smart gamification and behavioral science to make education feel less like a chore and more like an adventure!
>
> Teachers, you're in control - customize every feature to match your style! It's education reinvented with a playful twist. Wave goodbye to boring and hello to learning that actually makes students smile!

**📜 Evidence and Theory Driven**
> ### The Numbers Speak: Delphinium Works!
> Delphinium enhances learning using three core principles: social presence, behavioral economics/nudges, and self regulated learning to address isolation, lack of structure, and lack of focus in online learning environments. It adds a visual layer to Canvas that includes progress tracking, personalized dashboards, and gamification elements.
>
> Studies show significant results, including a 31% reduction in failure rates at Davis Connect across 72 classes with 6,000 students.

CTA: **↪ Schedule Your Free Tour**

### Testimonials
> ## Here's What People are Saying!

Eight anonymous quotes; see section 5. ⚠ Every headshot on this slider is AI-generated (HubSpot folder `AI-Generated Media/Images/...` and `Google_AI_Studio_...png`). That's a HANDOFF hard no, so do not reuse the images.

CTA: **↪ Let's Talk - Schedule Now!**

### Products
> ## Our Delphinium Products!
> ### Engagement Builder · ### Community Builder · ### Engagement Builder + Community Builder

These are tabs on a pricing-comparison module. The price spans (`plan_cost`) are empty in the HTML, so no prices are shown.

> ## Student Engagement
> **Improve student performance**: Nudge students with progress and completion trackers, grade reports, count down timers, etc.
> **Get more student time-on-task**: Effortless gamification with avatars, achievements, prize boxes, leaderboards, celebrations, etc.
> **Amplify your 'special sauce'!**: Customize layouts to bring your style, energy, and personality to Canvas
> **Intervene early and often**: Teachers quickly see a student's entire progress journey, at a glance, and act on it
> **Build trust through consistency**: Layout templates create familiar experiences by standardizing designs across courses
> **Catch struggling students early**: See performance for the whole class at a glance and identify in real time who needs attention now
>
> ## Messaging Center
> **Connect when it counts**: Instantly find and reach out to students in need with individualized communication. Real help, right now.
> **Effortless communication that works**: Automate, not overwhelm—the right information, for the right stakeholder, at the right time!
> **Communicate smarter, not harder!**: Schedule messages to free your time and focus for students—Reliable, proactive, and consistent
> **Streamline student outreach**: Automagically target students in need with simple, just-in-time nudges and real-time data
> **Drive assignment completion**: Keep students on track with timely reminders that celebrate progress and prompt action
> **Messages people actually see**: Loads of new ways to reach out, including banners, profile email addresses, and to do list messages
> **Give personal attention, at scale**: Personalize detailed messages that you write once and apply to everyone, with their own course data
> **Drive best practices in communication**: Use templates to make effective communication for teachers a breeze!

CTA: **↪ Get Started Today!**

### CTAs on the live HE page
Every CTA ("Schedule a FREE demo!", "Schedule Your Free Tour", "Let's Talk - Schedule Now!", "Get Started Today!") opens the same HubSpot meetings popup at `https://delphi-me.com/meetings/jared381/educate`. Don't reuse it; the HE twin should use the same booking target as v5 (Zoho Bookings `https://jared-delphi-me.zohobookings.com/4937208000000036014`, with `https://delphi-me.com/schedule-jared` as the rules-file CTA).

### HE-specific naming on the live page and in the prospectus
- **LMS:** Canvas only; no other LMS is mentioned anywhere.
- **Educator noun:** the live HE page says **"teachers"** throughout ("educators" once). The prospectus HE branch also keeps "teachers" and only swaps **"school" → "institution"** and removes parents. The HE research itself says **"instructors"** and **"faculty"** ("part-time instructors", "part-time faculty"). SOURCE.md's 25-word description says "teachers/faculty".
- **Learner noun:** "students" (never "kids" on the HE page).
- **Product names:** Control Tower, Community Builder, Engagement Builder, "Messaging Center" (v5 says "Message Center").
- **Headline variants:** "Delphinium Enhanced Canvas", "Help your students WANT to learn!"

---

## 2. Videos

**Summary:** 7 videos on the live HE page (6 HE-specific feature videos plus the shared research video). All 7 are also on the official YouTube channel, so the HE twin can use v5's existing `data-youtube` player with no new video plumbing. No HE testimonial videos exist (searched the channel and YouTube), which fits removing "In Their Own Words".

Speakers: the three thumbnails I checked are stock footage with Delphinium branding, which suggests narrated explainers rather than named speakers. **Transcripts couldn't be read:** the HubSpot caption URLs 404 and YouTube caption tracks now need a signed token. So I could not verify whether any HE video's narration mentions parents. Worth a quick listen (see open questions).

| Slot on HE twin | YouTube ID (official channel) | Title (verbatim) | Length | HubSpot player ID / MP4 | Replaces v5 video (line) |
|---|---|---|---|---|---|
| Hero "Watch" link | `9mfMC9jC6lU` | Higher Ed: Elevate and Amplify Learning with Delphinium | 2:52 | `200842257478` / [mp4](https://44351218.fs1.hubspotusercontent-na1.net/hubfs/44351218/Higher%20Ed_%20Elevate%20and%20Amplify%20Learning%20with%20Delphinium%20(1).mp4) (3840x2160) | `id9dqfNZsf4` Online: Elevate and Amplify... (2661) |
| Control Tower | `MBYmCCeZqxo` | Delphinium (HE): Insightful Data | 3:54 | `200639467615` / [mp4](https://44351218.fs1.hubspotusercontent-na1.net/hubfs/44351218/Delphinium%20(HE)_%20Insightful%20Data.mp4) | `xC1b-9bZW4w` (K12): Insightful Data (2776) |
| Community Builder | `4vzDJ1poyvU` | Delphinium (HE): Communication that works! | 4:16 | `200639467612` / [mp4](https://44351218.fs1.hubspotusercontent-na1.net/hubfs/44351218/Delphinium%20(HE)%20Communication%20that%20works!.mp4) | `acjbTVs8IUM` (K12): Communication that works! (2828) |
| Makeover | `63Iu4Xxg_tg` | Delphinium (HE): Meaningful Engagement | 6:01 | `200637993903` / [mp4](https://44351218.fs1.hubspotusercontent-na1.net/hubfs/44351218/Delphinium%20(HE)_%20Meaningful%20Engagement.mp4) | `Ek-BBS8rP_0` (K12): Meaningful Engagement (2925) |
| Engagement Builder | `xbdP6GSjPgY` | Delphinium (HE): Effortless Gamification | 5:18 | `200637999988` / [mp4](https://44351218.fs1.hubspotusercontent-na1.net/hubfs/44351218/Delphinium%20(HE)%20Effortless%20Gamification.mp4) | `ejtU7miZWD4` (K12): Effortless Gamification (2971) |
| Proof (unchanged) | `UgEyq7gUWmM` | Delphinium: Evidence, Research, and Theory | 8:48 | `192181846914` / Mux `PtipLiqu7EsqXrOAuUpRHGjYJRAPqHOlP3qPQ1tXNJw` | same video on both pages (3134) |
| Easy to deploy | `U615qsZh8bc` | Delphinium (HE): Integration is Easy! | 5:33 | `201569198403` / [mp4](https://44351218.fs1.hubspotusercontent-na1.net/hubfs/44351218/Delphinium%20(HE)%20Integration%20is%20Easy!.mp4) | `L90IoF6LGAE` (K12): Integration is Easy! (3172) |
| ~~In Their Own Words~~ | none | none | | | `Tp3IO0TzvM0` Digital Learning and Curriculum Directors, `3N0SXpFT36w` Teachers and Instructional Coaches (3031, 3037): **remove section** |

Notes:
- YouTube durations match the HubSpot durations to the second, so these are the same cuts.
- A duplicate of the hero video also exists on Jared's personal channel (`7JtTNfx53HA`, @jaredchapman9537, same 2:52). Use the official-channel `9mfMC9jC6lU`.
- Hero watch label shipped on `/highered` (owner request, 2026-09-29): "Watch: Higher Ed, elevated". `/home` keeps "Watch: Online learning, elevated". The visible text is a whole-label `dk`/`dh` swap, and a small Header-box script sets the HE link's `data-title` and `title`, so the video modal heading, the iframe title, and the dialog name also read "Watch: Higher Ed, elevated" on `/highered`.
- The HubSpot MP4s are public (HTTP 200, `video/mp4`) and would also work as `href` fallbacks. They'll disappear at HubSpot cutover, though, so YouTube is the durable choice.
- Posters: YouTube `maxresdefault.jpg` exists for all six; local copies are in `design-loop/2026-09-28/he-prospectus/thumbs/`.

---

## 3. Logos

**Summary:** 4 institutions on the live HE page; 3 of them are in the HE prospectus. v5 already hotlinks its K-12 logos from `delphi-me.com/hs-fs/hubfs/...`, so the HubSpot URLs work the same way today (and all break together at HubSpot cutover). The prospectus versions live on the internal quote tool's CloudFront, so I downloaded those three into `zoho-sites/assets/he/`.

| Institution | Live HE page (HubSpot, hotlinkable) | In HE prospectus? | Local copy | Notes |
|---|---|---|---|---|
| Utah State University | `https://delphi-me.com/hs-fs/hubfs/Imported%20sitepage%20images/logo_usu.png?width=471&height=300&name=logo_usu.png` | Yes | `zoho-sites/assets/he/utah-state-university.png` (PNG 600x600, lots of padding; trim for the strip) | |
| University of Tampa | `https://delphi-me.com/hs-fs/hubfs/university-of-tampa-logo-png_seeklogo-454256.png?width=640&height=640&name=university-of-tampa-logo-png_seeklogo-454256.png` | Yes | `zoho-sites/assets/he/university-of-tampa.jpg` (JPEG 1024x1024, white background; trim) | The HubSpot file came from seeklogo.com, a third-party logo site. |
| Utah Valley University | `https://delphi-me.com/hubfs/UVU-Institutional-Square-Mark-2016.svg` (square mark, SVG) | Yes | `zoho-sites/assets/he/utah-valley-university.webp` (WebP 204x120 wordmark) | The prospectus uses the wordmark, the live page the square mark. The SVG is the best quality source. |
| Rutgers University–Newark | `https://delphi-me.com/hs-fs/hubfs/Rutgers_University_Newark_logotype.svg.png?width=1280&height=405&name=Rutgers_University_Newark_logotype.svg.png` | **No** | not downloaded | Only on the live page. SOURCE.md says not to add school names beyond what's cleared, so confirm with Jared. |

Salt Lake Community College is the prospectus *recipient*, not a displayed customer logo. Don't add it.

With only 3 or 4 logos, v5's infinite marquee (which clones the list) will look thin and repetitive. A static centered row is probably better.

---

## 4. HE stats and claims

### 4a. HE outcome proof (prospectus, HE branch; replaces Davis 31%)
Rendered on the cover (big number with an asterisk) and on the "Proof it works" page.

| Verbatim | Context in prospectus | Phrasing note under our rules |
|---|---|---|
| **47%** "fewer failures overall" | source line "~420 students • 14 sections"; footnote "* See last page for research details" (the last page is only the citation list) | Proposed HE equivalent of the 31% rule: promises and CTAs say **"up to 47%"** (SOURCE.md 09-16 prefers "as much as"); exact **47%** only with study context (~420 students, 14 course sections). **Which study, and whether we can name it, is unconfirmed**; see open questions. Never "Results like a 47%" (the prospectus ROI line uses exactly that pattern, which is banned for 31%). |
| **65%** "fewer failures for part-time faculty" | "Key Outcomes" list beside the 47% | **Superseded:** Jared 2026-09-29 set the public part-time faculty figure to **64%**, not 65% (owner correction on the live HE page). Strong HE-native hook; it matches the title of Chapman & Andrade (2024), "Improving part-time instructors' student failure rate...". Use only with study context. |
| **68%** "fewer withdrawals" | Key Outcomes | **Superseded:** Jared 2026-09-29 set the public withdrawal figure to **67%**, not 68% (matches SOURCE.md and his 09-16 note). |
| **66%** "fewer dropouts" | Key Outcomes | **Superseded:** Jared 2026-09-29 set the public dropout figure to **65%**, not 66% (matches SOURCE.md). SOURCE.md defines HE "dropout" as finishing with less than about a third of points. Publicly, "dropout" may read as leaving college, so prefer the definition or skip this stat. |

**What Chapman & Andrade (2024) actually says (Springer abstract):** it "compared student failure status in course sections taught by part- and full-time instructors both with and without an EEIS" and found the tool "can help improve student failure rates in courses taught by part-time faculty members and bring students' performance to parity with the performance of students taught by a full-time instructor." Authors are at the Woodbury School of Business, Utah Valley University. The abstract does **not** state 47%, 65%, ~420, or 14 sections, so I can't confirm the prospectus numbers come from this paper. *(The prospectus 65% part-time figure was corrected by Jared to 64% on 2026-09-29.)*

### 4b. HE "hidden costs" (prospectus HE branch; replaces 1 in 4 / 1 in 3 / $229K)
Heading in prospectus: "When engagement breaks down..."

| Tag | Verbatim number and label | Source as printed | Note |
|---|---|---|---|
| Retention | **~1 in 3** "first-year students don't return for year two — seats and tuition that never come back." | NCES / IPEDS retention | Third-party national stat, now approved via the prospectus. Not independently verified here. |
| Completion | **~40%** "of students finish a bachelor's in 4 years (≈60% in 6). Time-to-degree keeps stretching." | NCES graduation rates | Same. Bachelor's-specific; community-college audiences may not see themselves in it. |
| DFW / cost (climax card) | **"DFW"** "spikes in gateway courses when students disengage — each withdrawal or failure is paid-for twice." | Campus DFW & cost-of-attrition patterns | No number and not a citable source. Keep it as a qualitative card or drop it; don't invent a DFW %. |

Superseded: see 4b-2 for shipped HE cards (owner approved 2026-09-29).

Shared lines from the prospectus that work for HE: "These aren't three separate crises. They share one common driver: **disengagement**." and "Doing nothing is the most expensive option on the table."

### 4b-2. HE hidden-cost stats from Jared's HigherEd Deck slide 'A Few Sobering Statistics' (2026-09-29)
Owner-supplied source: Jared attached the slide on 2026-09-29 and asked to draw the HE "When engagement breaks down..." cards from it. Third-party national stats as printed on the slide; not independently verified here. The 4b NCES retention and completion figures also ship, inside card A below. The 4b DFW card stays out.

Slide text (verbatim):
- "Low-income and underprepared students have withdrawal rates that are 10-15% higher in online courses" (Columbia University)
- "About 4 in 10 students drop out of college" / "~2M students dropout each year with student debt" (National Center for Education Statistics)
- "People without a degree make ~$1M less over their lifetime, and they are twice as likely to be unemployed" (Pew Research Center)

**Shipped on `/highered` (2026-09-29).** Ground truth is the HE card markup in `zoho-sites/homepage-sites-v5.html`. K-12 cards and copy are unchanged.

| Card | Kicker | Number | Text | Source line | Source doc |
|---|---|---|---|---|---|
| A, stat 1 | Completion and retention | 4 in 10 | students drop out of college. About **2M a year** leave with student loan debt, but no degree to help pay for that debt. | National Center for Education Statistics (NCES / IPEDS), once for the whole card | 4b-2 slide (NCES) |
| A, stat 2 | (same card) | 1 in 3 | first-year students don't return for year two. | (same) | 4b (NCES / IPEDS retention) |
| A, stat 3 | (same card) | 60% | of students don't finish a bachelor's in 4 years; **40%** still haven't in 6. | (same) | 4b (NCES graduation rates, inverse framing) |
| B | Higher withdrawal rates | 10–15% | for **lower income and underprepared** students in online courses. | Columbia University | 4b-2 slide |
| C | Earnings and employment | $1M | less in lifetime earnings without a degree, and **twice** as likely to be unemployed. | Pew Research Center | 4b-2 slide |

- **Card A (tall, HE-only `.dl-he`):** kicker "Completion and retention" (uppercased by CSS), then three stacked stats in the order above, each a big navy number with its text below. No tildes on any number. Stats are separated by spacing only; there are no divider lines. One source line at the bottom covers all three stats and replaces the earlier per-card source lines (National Center for Education Statistics / NCES graduation rates / NCES / IPEDS retention); "(NCES / IPEDS)" keeps the IPEDS retention attribution. The card is bare `<p>`s to keep Zoho Header Code under its cap.
- **Cards B and C:** share markup with the K-12 Achievement and Cost cards through `.dk`/`.dh` spans. The K-12 Attendance card is a K-12-only shell (`class="dl-card dk"`, hidden on `/highered`).
- **Layout:** 960px and up, two equal columns: card A on the left spans both rows, B top right, C bottom right, equal-height rows with source lines pinned to card bottoms. 720–959px: card A full width, then B and C side by side. Under 720px: one column, A, B, C.
- **Punch line:** "These are the stats that *keep us up at night*, and the reason we made Delphinium." then the shared "Doing nothing is the most expensive option you have." K-12 keeps "Three crises, one cause: disengagement."

**Owner approvals (Jared, all 2026-09-29):**
- **Slide as source:** attached the slide and asked for the HE cards to come from it.
- **Restore the 4b stats:** "give me all the cards, add back the ones you removed and the other stats from the slide as cards." (The 1 in 3 and completion stats had briefly been replaced.)
- **One tall card:** "these all have the same source. Combine into one tall card, with the other two cards to the right. Title: Completion And Retention. list the stats big, with text below, and pin line between." Supersedes the earlier five-card orders ("first card, followed by completion", "move to top right", "move to bottom left") and the kicker history ("Dropouts", then "Retention"). The owner later removed the pin lines; spacing only now.
- **Stat order:** "move this stat up one, pull 60% down" (was 4 in 10, 60%, 1 in 3).
- **Tildes removed:** "remove all the ~" on card A (were "~4 in 10", "~1 in 3", "~60%") and "remove ~" on card C ("~$1M" to "$1M"). The slide prints "~$1M"; dropping the tilde is an owner decision, not a new source.
- **2M line:** owner wording ("student load debt" read as "student loan debt"). It folds the slide's "~2M students dropout each year with student debt" into stat 1, so the separate "Student debt ~2M" card was removed.
- **Earnings merge:** the separate "Employment 2x" card was folded into card C's text ("**twice** as likely to be unemployed"). A "~$1M & 2x" number was tried and reverted ("don't change title").
- **1 in 3 text:** "remove second sentence" (dropped "Seats and tuition that never come back.").
- **60% inverse framing:** "reframe this card in the opposite, something like 60% of students don't finish in 4 years, 40% don't finish in 6..."; then "pull out of (), make part of sentence"; then "remove second sentence"; then "can you get this to one line". It was tightened, not shrunk: ", and about" became ";" (dropping "about" matches the tilde removal), type size unchanged. One line at 1440 and at a 483px text box, two lines at 390.
- **Bolds (each with the element selected):** "bold 2M a year" (4 in 10 text), "bold 40%" (60% text), "bold lower income and underprepared" (Columbia text), "bold twice" (Earnings text).
- **Punch line:** owner wording; replaced "Many crises, one cause: disengagement."

**Claims ceiling and wording rules:**
- Every number traces to a named source: the slide (Columbia, NCES, Pew) or the 4b NCES / IPEDS figures from the prospectus. No new stats.
- 60% / 40% is the inverse of the NCES graduation rates in 4b (40% finish a bachelor's in 4 years, 60% in 6). Same data. Bachelor's-specific; community-college audiences may not see themselves in it.
- Keep 10–15% as a range; the slide doesn't say points vs relative. "Higher" is carried by the kicker, and "lower income" paraphrases the slide's "Low-income".
- Keep "About" on 2M. It is the only approximation word left; all tildes are gone by owner decision.
- "Drop out of college" means leaving college, not the HE proof's "dropout" (finished with less than about a third of points; see 4a).

### 4c. HE-branch copy variants (prospectus), for reuse
- Cover lead (HE): "Delphinium transforms your existing Canvas courses into **engaging** student experiences, and an **early-warning** system for teachers." (K-12 version: "for parents and teachers.")
- Case lead (HE): "More education has moved online - and students expect that access now. But delivering content online is not the same as engaging students. In a classroom, teachers can read the room, catch a glance, stand by a student who is drifting, or capture focus with a quick activity. **None of that survives the move to a screen.** Engagement has been waiting for online tools to catch up." (K-12 adds "and families".)
- Thesis: "Your **institution** has strong curriculum, capable teachers, and a platform to deliver it all..."
- Multiply diagram (HE): the "Families" row and "Families feel connected, informed, and confident" are removed. What's left: "Students that see the whole path — and own it" / "Teachers that reach the right student at the right time" / "More students succeed — the first time" / "Attendance, completion, and retention rise" / "Teachers do more in less time, with less frustration".
- HE ROI line (⚠ don't reuse as written): "Results like a 47% drop in failures — and sharp declines in withdrawals and dropouts — mean more of every tuition dollar and instructional hour reaches completion — the same budget, working harder, every year. Doing nothing is the most expensive option on the table."
- Product module HE rewrites (the app's `hy()` function): "students and families" → "students"; "student and parent apps" → "student app"; CB intro drops "families know how to help"; drops "a targeted group, parents, or"; drops "loop parents in" items; "every family hears" → "every student hears"; EB intro "so parents and teachers can step in at the right moment" → "so teachers can step in at the right moment"; Control Tower Ultra "students, parents, teachers, and admins" → "students, teachers, and admins".
- "Your **institution** already runs on Canvas — make it work harder for you"; "paid off, at scale, in **institutions** like yours!"

### 4d. Carries over unchanged (prospectus renders these in both branches)
| Claim (verbatim) | On v5? | HE use |
|---|---|---|
| **72%** "of students say Delphinium is more or much more motivating than a traditional course" | Yes (3079) | Keep. The prospectus shows it on the HE version too. Confirm the survey population is fine for HE (see open questions). |
| "**Fun**" is one of the most common words; Netflix quote | Yes (3084, 2937) | Keep, same caveat. |
| **14 yrs** of published research / **10** peer-reviewed studies & book chapters / **230+** citations | Yes (3060-3062) | Keep. Jared approved these 09-28 (SOURCE.md). **Confirmed again (Jared 2026-09-29):** 10 peer-reviewed studies, 230+ citations. |
| "**Over 125,000 Delphinium enrollments this year**" | No | Candidate for the HE logo strip lede. It's in the prospectus (now approved for HE stats) but not in SOURCE.md, so confirm. |
| Trust cards: "Built on science: 14 years of published behavioral research" / "Lightning fast setup: Transform your class instantly - just turn Delphinium on" / "Zero learning curve: Teachers keep using Canvas exactly as before" | Yes (hero points) | Keep, with the noun swap. |
| About 3 minutes first course / about 45 seconds next course / about 20 minutes account-wide install | "3 minutes" yes | Keep. **Confirmed (Jared 2026-09-29):** "go live in less than 3 minutes" supersedes "about three minutes". |
| Security pills: "FERPA", "HECVAT available", "US-hosted on AWS", "Canvas LTI 1.3", "WCAG 2.0 AA / Sec 508" | v5 has FERPA, HECVAT, **WCAG 2.1 Level AA**, LTI 1.3, US-hosted on AWS | HECVAT is especially relevant for HE buyers. ⚠ The prospectus says WCAG 2.0 AA while v5 says 2.1 AA; v5's wording is covered by Jared's 09-28 "all claims are accurate". **Confirmed (Jared 2026-09-29):** WCAG 2.1 Level AA is accurate and supersedes "WCAG 2.0 AA / Sec 508". |
| Auto-translate: the prospectus CB module says "**100 languages**" | v5 says **240** (2799) | SOURCE.md 09-28 locks **240** ("supersedes older 160-language notes"). Use 240. |

### 4e. K-12 stats on v5 and what happens to them on the HE page
| v5 stat (line) | HE equivalent | Action |
|---|---|---|
| "Cut failures, up to 31%!" (2669-2670) | up to 47% (4a) | **Replace**, pending Jared's confirmation of 47% and the phrasing rule |
| Davis Connect card: 31%, 72 classes, 6,000 students (3069-3075) | 47% HE study card with ~420 students / 14 sections and the 64/67/65 list | **Replace** |
| 1 in 4 chronically absent (2693) | ~1 in 3 don't return for year two | **Replace** |
| 1 in 3 below grade level (2699) | ~40% finish a bachelor's in 4 years | **Replace** |
| $229K cost of a K-12 education (2705-2706) | DFW card (no number) | **Replace**, or drop to two cards |
| 72% more motivating (3079) | same | **Carry over** |
| "Fun" (3084) | same | **Carry over** |
| 14 yrs / 10 / 230+ (3060-3062) | same | **Carry over** |
| 240 languages (2799) | same | **Carry over** (drop "Keep parents in the loop" next to it) |
| Natalie ~12 emails/day / Saturday nights (2771) | none | **Drop** (K-12 teacher) |

Superseded for the 1 in 4, 1 in 3, and $229K rows: see 4b-2 for shipped HE cards (owner approved 2026-09-29).

### 4f. On the live HE page but not for the new HE page
- "Studies show significant results, including a 31% reduction in failure rates at Davis Connect across 72 classes with 6,000 students." This is a K-12 study on the HE page. Drop it in favor of 4a.
- "Since 2012, Dr. Jared R. Chapman ... has conducted extensive research". Consistent with "14 yrs"; OK as founder context.

### 4g. Pricing
Removed. Pricing never goes on the homepage or in this repo (HANDOFF hard no). The raw prospectus research stays local and uncommitted.

---

## 5. HE testimonials

**Bottom line: there are no testimonials attributed to a Higher Ed person anywhere in these sources.**

### Live HE page ("Here's What People are Saying!"): anonymous, AI-generated headshots
| Quote (verbatim) | Attribution | Usable? |
|---|---|---|
| "Delphinium has been a game changer for teachers and students!" | Online School Administrator | Reads as K-12; AI headshot |
| "Delphinium encourages students' personal responsibility" | EdTech Director | Role-neutral; unknown source |
| "Delphinium gives me much more one-on-one time with my students" | Math Teacher | Likely Natalie (K-12) paraphrase |
| "We are seeing better success with Delphinium's use!" | EdTech Specialist | Likely Ryan Hansen (K-12) paraphrase |
| "I saw that I was doing much better than I thought I was." | Student | Role-neutral; may come from Jared's HE research. Ask. |
| "The messaging and grade visualization tools are big time savers!" | Technology Teacher | Reads as K-12 |
| "Students feel they are getting constant personal attention and feedback." | Technology Teacher | Reads as K-12 |
| "I spent more time studying for this class than other classes." | Student | Role-neutral; may come from HE research. Ask. |

### HE prospectus: all K-12 quotes, unchanged in HE mode
- "We can confidently say that we're seeing better success with Delphinium — look at our data there and see that we improved significantly." (Ryan Hansen, Digital Learning Director, Davis School District; shown on the K-12 cover only; the HE cover shows the 47% list instead)
- Pull quote, HE version: "There's downsides to Canvas, if you ask **students**, they don't like Canvas. It's basic, it needs something else to engage in the way we're looking for. Canvas itself falls way short." attributed "**- Online learning leader**". ⚠ This is Ryan Hansen's K-12 quote with "kids" changed to "students" and his name removed. **Don't use it on the HE page.**
- Product-module quotes (the HE branch doesn't change them): "I can see - with color - my students' progress!..." (High School Math Teacher); "We can send targeted communication to specific groups of kids..." (Digital Learning Director); "It saves me so much time in my communication..." (Teacher); "You just saved me hours of mail merging!..." (Curriculum Director); "Students have redone a quiz they did poorly on..." (Tiffany Dance, Instructional Coach, Davis Connect); "There's a lot of data in Canvas. It's getting it out in a usable way - that's what we need." (Ryan Hansen)
- "In their words..." block: Instructional Coach / Online Teacher / Math Teacher (all K-12)

**Recommendation (superseded 2026-09-28):** Jared's decisions plus the HE handout now provide usable quotes. See "Quotes plan" at the end of the HE handout section below.

---

## HE handout (Delphinium HiEd Handout.pdf)

**Source:** `c:\Users\10618071\OneDrive - Utah Valley University\My Files\Business\Presentations\Delphinium HiEd Handout.pdf`, provided by Jared 2026-09-28. Two pages (630x810 pt, print handout). Read via the text layer and checked against renders at `design-loop/2026-09-28/he-handout/page-1.png` and `page-2.png` (uncommitted). Both QR codes decode to `https://www.delphi-me.com/engage`, which currently 301-redirects to the plain `delphi-me.com/` homepage (checked 2026-09-28).

### Quotes (verbatim; the handout gives no names, schools, or roles beyond the group label)
| # | Quote (verbatim) | Handout label | Proposed generic attribution | Parent / kid mention? | Notes |
|---|---|---|---|---|---|
| H1 | "I liked knowing that a little extra effort would make a difference." | Students say... | **Student** | No | New; not on the live HE page. |
| H2 | "I saw that I was doing much better than I thought I was." | Students say... | **Student** | No | Also on the live HE page as "Student" (AI headshot there; don't reuse the headshot). |
| H3 | "Students feel they are getting constant personal attention and feedback" | Teachers say... | **Teacher** | No | Also on the live HE page as "Technology Teacher". The source has no closing period; add one in shipped copy. |
| H4 | "The ease of Delphinium [gives] me much more opportunity to work one-on-one with my students" | Teachers say... | **Teacher** | No | Near-duplicate of the live HE page's "Math Teacher" line and very likely a paraphrase of Natalie Niederhauser (K-12), so keep it as "Teacher", never "Faculty". The bracket is in the original. |

- None of the four says professor or instructor, so **no quote qualifies for "Faculty member."**
- **"Student"** isn't one of Jared's two labels ("Teacher" / "Administrator"), but it matches the handout's own "Students say..." label. Confirm with Jared.
- No parent, family, or kid words appear anywhere in the handout.

### Stats and claims (verbatim, with context)
| Claim | Context | Status vs Jared's decisions / prospectus |
|---|---|---|
| "Cut failures by up to 47%" | Page 1 "Real Outcomes:" box, no study named | **Consistent** with "up to 47%" for promises (no exact 47%, so no study needed). |
| "Reduce absenteeism" | Page 1 "Real Outcomes:" box, second bullet, no number | **Flag:** not in SOURCE.md, Jared's decisions, or the HE prospectus stats. The closest prospectus line is the generic "Attendance, completion, and retention rise" diagram. Don't ship it until Jared confirms it's backed for HE. |
| "Turn Canvas into an early-warning system" | Page 2 feature heading over the Control Tower screenshot | Matches SOURCE.md positioning. |
| "Do more, in less time" | Page 2 H1 | Qualitative; fine. |

The handout has **no** withdrawal/dropout numbers, no part-time faculty figure (prospectus 65%, corrected by Jared to 64% on 2026-09-29), no study name, and no 72% / "Fun" / Netflix lines. **Nothing conflicts** with Jared's 64% part-time / 67% withdrawal / 65% dropout / UVU decisions.

### Headlines and positioning (verbatim; em dashes in the source must be dropped in shipped copy)
- "Canvas delivers **content**." / "delphinium delivers **ENGAGEMENT**" (page 1 hero lockup). Strong HE hero or Case-section contrast line.
- "Which class would **YOU** rather take?" (page 1, above the plain Canvas vs "Canvas + Delphinium!" comparison). v5 uses "rather finish?"; "take" is the handout wording, so either works.
- "Real Outcomes:" (label for the outcome bullets).
- "Ready to transform your Canvas?" / "Let's Talk!" (page 1 CTA).
- "Do **more**, in **less time**" (page 2 H1).
- "Turn Canvas into an **early-warning** system" (Control Tower).
- "Support students—effortlessly" (Message Center / Community Builder). Ship as "Support students, effortlessly" or "Support students effortlessly".
- "Transform Canvas into an **engagement** engine!" (Engagement Builder).
- "Empower students with clear signals, so they can **take charge** of their own learning" (intro over the quotes).
- "Learn how!" / "Schedule a Demo Now" (page 2 CTA).

### Product and feature names
The handout never names the products in text ("Control Tower", "Community Builder", and "Engagement Builder" don't appear). It shows them only as screenshots:
- **Control Tower roster** (columns Image, First Name, Last Name, Grade, Points, Activity, Status, Details, Message) plus a student details panel (Grade, Total, Progress, Engagement counts: Not Sure, Missing, Late, Excused). The details panel shows an **"Observers"** option.
- **Message scheduler** (Orientation: "Welcome to class", "One week down", "Explain due dates"; Progress: "Trouble getting started", "Low Activity Warning") plus a "Create Message" dialog with a visible **"Include Observers"** checkbox.
- **Engagement widgets:** "Who's Near Me?" leaderboard (Platinum / Diamond / Gold tiers), "Prize Boxes", "Avatar" ("Level: 6", "FREE HUGS" sign), "% of Assignments Complete" gauge, "Performance" ("Work Quality 97.4%", a UI mock value, not a claim), "Achievements" / "Brag Board", "Tracker" (Mastery / Practice).
- **Page 1 comparison mock:** a plain Canvas module ("Unit 5: Nuclear Chemistry", "Understand the role of the nucleus") vs a Delphinium course home ("Math — Ms. Rogers", a "Riverstone Academy" crest, a "Last Day to Submit Assignments" countdown, "Weekly Assignments" tiles). Riverstone is a demo school, not a customer.

**Screenshot implication for HE:** the handout's own screenshots visibly show observer UI (the details panel and "Include Observers"). If v5's `message.png` and Control Tower crop come from the same screens, recrop them for HE (open question 11).

### Logos and CTAs
- **Logos:** Delphinium wordmark only (page 2, bottom left). **No customer or university logos.** The page 1 stock portrait is a photo, not a testimonial; don't pair it with a quote.
- **CTAs:** "Let's Talk!" and "Learn how! / Schedule a Demo Now", each with a QR code to `https://www.delphi-me.com/engage` (redirects to the homepage) and the text "delphi-me.com". The HE page should keep the house booking CTA (v5's Zoho Bookings target / https://delphi-me.com/schedule-jared), not `/engage`.

### Quotes plan (5 pull quotes plus the existing student survey line)
| HE section | Quote | Attribution | Source |
|---|---|---|---|
| Control Tower | "The ease of Delphinium [gives] me much more opportunity to work one-on-one with my students." | Teacher | Handout H4 (replaces Natalie Niederhauser) |
| Community Builder | "Students feel they are getting constant personal attention and feedback." | Teacher | Handout H3 |
| Community Builder | "You just saved me hours of mail merging! This saves teachers so much time and really brings that part of personalized learning that we all strive to reach." | Administrator | K-12, verbatim from v5 2811 (Curriculum Director; name dropped) |
| Makeover / Engagement Builder | "I saw that I was doing much better than I thought I was." | Student | Handout H2 (replaces the Ryan Hansen "kids" quote) |
| Makeover / Engagement Builder | "I was sitting on the couch watching Netflix and the thought popped into my head: I could be doing homework right now, and I did!" | Delphinium student survey response | Kept from v5 2937 (already cleared) |
| "Nobody quits" | "I liked knowing that a little extra effort would make a difference." | Student | Handout H1 (replaces Tiffany Dance) |

**Alternates if Jared prefers:**
- Community Builder: "We can send targeted communication to specific groups of [students], and the data shows us exactly who those [students] are." (Administrator; K-12 Ryan Hansen, "kids" changed to "[students]", which keeps the meaning. Brackets keep the edit visible, and the en dash is swapped for a comma.)
- "Nobody quits": "We have had students redo a quiz that they did poorly on to earn more points so they could just earn googly eyes for their avatar!" (Teacher; K-12 Tiffany Dance, Instructional Coach).
- Excluded: "If you ask kids, they don't like Canvas..." (a negative Canvas framing, the prospectus already re-attributed it once, and it adds nothing the Makeover shows).

---

## 6. Section-by-section proposal: v5 K-12 → HE twin

Same design system and section order unless noted. Nav: add a clear **K-12 | Higher Ed** toggle at the top of both pages (the live site's "My institution is... K12 / Higher Ed" pattern).

| v5 section (lines) | HE action | What changes |
|---|---|---|
| Top nav (2610-2645) | **Keep and adapt** | Add the K-12 / Higher Ed toggle. Nav and mobile-nav link "In Their Own Words" (2624, 2640) currently points to `#customers` (the logos); relabel it "Who's using it" or remove it. |
| Hero (2649-2678) | **Keep and adapt** | h1 unchanged. Lead: drop "parents and". Cover stat "Cut failures by up to **47%**" (handout wording; approved as "up to 47%"). Optional hero lockup from the handout: "Canvas delivers content. Delphinium delivers engagement." Watch link: `9mfMC9jC6lU`, label "Watch: Higher Ed, elevated" (shipped 2026-09-29). Hero point: "Instructors keep using Canvas exactly as before." |
| Case / hidden costs (2681-2713) | **Keep structure, replace stats** | Lede: "instructors can read the room". Cards: Retention ~1 in 3, Completion ~40%, DFW (4b). Punch line unchanged. Superseded: see 4b-2 for shipped HE cards (owner approved 2026-09-29). |
| Teach (2715-2745) | **Keep and adapt; remove the parent card** | Keep 3 cards with the noun swap. Remove "Parents in the dark" (2737-2741). Optional replacement card for Jared: "Stretched-thin faculty. Part-time instructors carry a large share of online sections, with little time to chase every student." (Qualitative, grounded in the Chapman & Andrade abstract; approve before use.) |
| Control Tower `#product` (2747-2784) | **Keep and adapt** | Sub: "so faculty see". Optional eyebrow/h3 from the handout: "Turn Canvas into an early-warning system". Replace "Send mass-messages to parents". Swap the Natalie Niederhauser quote for handout H4, attributed "Teacher". Video: `MBYmCCeZqxo`. Alt text: drop "observers" (the handout screenshots visibly show observer UI; recrop if v5's crop does too). |
| Community Builder (2786-2838) | **Keep and adapt** | Drop "And include their parents too!" and "Keep parents in the loop with a single click". Keep 240 languages. Optional line from the handout: "Support students, effortlessly". Quotes: handout H3 ("Teacher") plus Sarah Ruiz's mail-merge quote, attributed "Administrator" with no name. Drop the Ryan Hansen quote, or use it as the bracketed "[students]" alternate. Video: `4vzDJ1poyvU`. Alt text: drop "observers" (the handout's "Create Message" dialog shows an "Include Observers" checkbox). |
| Makeover / Engagement Builder (2840-2943) | **Keep and adapt** | Keep the before/after (the demo module is chemistry, which works for HE too). Headline: "Which class would YOU rather finish?" (v5) or "...rather take?" (handout). Remove the parent sentences at 2922. Replace the Ryan Hansen "kids" quote (2932-2935) with handout H2 ("Student"). Keep the Netflix student quote. Video: `63Iu4Xxg_tg`. |
| "Nobody quits" (2945-2987) | **Keep and adapt** | Copy works for HE; "teachers" → "faculty" at 2961. Replace the Tiffany Dance quote with handout H1 ("Student"), or keep Tiffany's googly-eyes line as "Teacher". Video: `xbdP6GSjPgY`. |
| Logos `#customers` (2989-3023) | **Replace** | "See who's using Delphinium" stays; lede "Trusted by institutions like yours." (optionally "Over 125,000 Delphinium enrollments this year", pending). Logos: USU, Tampa, UVU (plus Rutgers–Newark if cleared). Static row instead of a marquee. |
| Videos `#videos` "Hear it from educators" (3025-3044) | **Remove** | Jared's requirement; no HE testimonial videos exist anyway. |
| Proof `#proof` (3046-3141) | **Keep and adapt** | Keep the research record (14 yrs / 10 / 230+). Replace the Davis card with the HE study card (47% plus 64/67/65, ~420 students / 14 sections). Keep 72% and "Fun" (pending). Pillars: "Instructors reach the right student...". Research modal: keep; Chapman & Andrade (2024) is already first. Video `UgEyq7gUWmM` unchanged. |
| Easy to deploy (3143-3179) | **Keep and adapt** | h2 "Instructors and content don't change, Engagement does." Noun swaps. Trust pills stay (HECVAT is useful here). Punch: "Your institution already runs on Canvas". Video: `U615qsZh8bc`. |
| Closing CTA (3181-3209) | **Keep** | No audience words. Same booking target as v5. |
| Footer (3212-3270) | **Keep and adapt** | Remove or relabel the "In Their Own Words" link (3246). Add the audience toggle or a "K-12" link. |
| Contact modal (3302-3372) | **Keep and adapt** | "School or organization" → "Institution or organization" (3327, and the JS email payload label at 4102). |
| `<meta name="description">` (8) | **Rewrite** | e.g. "The Canvas engagement layer for higher ed online programs. Turn the Canvas courses you already run into engaging student experiences and an early-warning system for instructors. Up to 47% fewer course failures." (pending) |

### Every parent / family / K-12 / kid / school / teacher mention in v5
Grep of `zoho-sites/homepage-sites-v5.html` (read-only; line numbers as of this fetch; `font-family` CSS hits excluded).

**Parents, families, observers, kids, K-12**
| Line | Current text | HE rewrite |
|---|---|---|
| 8 | meta: "The Canvas engagement layer for K-12 online schools. ... early-warning system for teachers. Up to 31% fewer course failures." | See the meta row above |
| 2658 | "...an **early-warning system** for parents and teachers." | "...an **early-warning system** for instructors." |
| 2706 | "the cost of a K-12 education and lost potential when students don't finish." | Replace the whole card (DFW card or drop). Superseded: see 4b-2 for shipped HE cards (owner approved 2026-09-29). |
| 2737 | `<li class="dl-card dl-teach__family">` (CSS hook) | Remove with the card |
| 2739 | "Parents in the dark" | **Remove** (or the optional faculty card) |
| 2740 | "Parents want to be the coach in their kid's corner, but most find out they're struggling after it's too late." | **Remove** |
| 2758 | "Send mass-messages to parents" | "Message every struggling student at once" |
| 2767 | alt: "...grades, progress, observers, and engagement counts..." | "...grades, progress, and engagement counts..." (also check whether the screenshot visibly shows an Observers field) |
| 2792 | "...with exactly the right information – automatically. And include their parents too!" | "...with exactly the right information, automatically." |
| 2798 | "Keep parents in the loop with a single click" | **Remove** |
| 2815 | "We can send targeted communication to specific groups of kids – and the data shows us exactly who those kids are." (Ryan Hansen) | Replace with handout H3 ("Teacher"), or use the alternate with "[students]" ("Administrator") |
| 2825 | alt: "...a supportive note to students and an option to include observers." | "...a supportive note to students." (check the screenshot for an "include observers" checkbox) |
| 2922 | "...so they own the journey. And parents get the same view! Turn parents from frustrated bystanders into the support system every student needs." | "...so they own the journey. And instructors see the same view, so they can step in at the right moment." (from the prospectus HE EB intro) |
| 2933 | "If you ask kids, they don't like Canvas. It's basic… it needs something else to engage…" (Ryan Hansen) | Replace with handout H2 ("Student") |

**Schools, districts, and K-12 identity**
| Line | Current text | HE rewrite |
|---|---|---|
| 2772 | cite "Natalie Niederhauser, High School Math Teacher, Davis Connect" | Replace with handout H4, cite "Teacher" |
| 2811-2812 | "...This saves teachers so much time..." (Sarah Ruiz, Curriculum Director) | Keep the quote verbatim; cite "Administrator" (no name or title) |
| 2844 | "For online students, Canvas *is* school..." | "For online students, Canvas *is* the classroom..." (optional) |
| 2981 | cite "Tiffany Dance, Instructional Coach" | Replace with handout H1 ("Student"), or keep line 2980 cited "Teacher" |
| 2993 | "Trusted by schools like yours." | "Trusted by institutions like yours." |
| 2997-3016 | K-12 logos (Davis School District, Utah Virtual Academy, Baker Web Academy, "Partner school logo", Kelsey Peak, Rocky Peak, AHS, Mewa, VPW) | Replace with HE logos |
| 3031-3040 | Videos "Digital Learning and Curriculum Directors" / "Teachers and Instructional Coaches" | **Remove section** |
| 3069-3075 | "The Davis Connect study" / "Davis School District, Utah. 72 online classes and 6,000 students." / "The courses didn't change. The teachers didn't change." | Replace with the HE study card; punch: "The courses didn't change. The instructors didn't change. Engagement did, and so did the outcomes." (only if true of the HE study design) |
| 3177 | "Your school already runs on Canvas" | "Your institution already runs on Canvas" |
| 3327 | "School or organization (optional)" | "Institution or organization (optional)" |
| 4102 | JS: `"School or organization: "` | Match 3327 |
| 3290 | Research ref (Barrus et al. 2016) mentions "high school and college students" | Keep (it's a citation title) |

**"Teacher" → "instructor" swaps** (if Jared picks "instructors")
| Line | Current text |
|---|---|
| 2674 | "**Zero learning curve.** Teachers keep using Canvas exactly as before." |
| 2686 | "In a classroom, teachers can read the room..." |
| 2753 | "...so teachers see who needs support at a glance..." |
| 2961 | "And teachers can always customize every piece." |
| 3124 | "Teachers reach the right student at the right moment..." |
| 3146 | h2 "Teachers and content don't change, Engagement does." |
| 3160 | "Teachers keep using Canvas exactly as before... Teachers do not learn a new tool." |

**Nav and footer labels tied to the removed section**
| Line | Current text |
|---|---|
| 2624, 2640 | nav "In Their Own Words" → `#customers` |
| 3246 | footer "In Their Own Words" → `#customers` |
| 3028 | h2 "Hear it from educators / Who use Delphinium every day." (removed with the section) |

---

## 7. Open questions for Jared

**Status 2026-09-28:** Jared's decisions (top of file) answer questions 1, 3, 4, 5, and most of 6. The study is named Utah Valley University; whether it is Chapman & Andrade (2024) is still open (question 2).

**New, from the HE handout:**
- **"Student" attribution.** OK to cite the two handout student quotes as "Student"? (It's outside the "Teacher" / "Administrator" pair, but it's the handout's own label.)
- **"Reduce absenteeism."** The handout claims it with no number. Is there HE data behind it, or should the HE page leave it off?
- **`/engage` QR target.** The handout QR codes go to `www.delphi-me.com/engage`, which now redirects to the homepage. Should it point to the HE page once that's live? (That's a HubSpot/DNS change, out of scope for this repo.)

**Original questions (turn 1):**

1. **HE outcome numbers.** The prospectus says 47% fewer failures, **65%** fewer failures for part-time faculty, **68%** fewer withdrawals, **66%** fewer dropouts (~420 students, 14 sections). SOURCE.md (your 09-16 note) says 47% / **67%** withdrawal / **65%** dropout. Which set is canonical? *(Answered 2026-09-29 by Jared: 47% / **64%** part-time faculty / **67%** withdrawal / **65%** dropout.)*
2. **Which study is the 47% from, and can we name it?** Is it Chapman & Andrade (2024), done at UVU? Should "dropout" be defined on the page (your definition: finished with less than about a third of points) or left off?
3. **The 47% rule.** Mirror the 31% rule ("up to 47%" in promises and the hero; exact 47% only with study context)? Or use "as much as 47%" as in your 09-16 note?
4. **Rutgers University–Newark.** It's on the live HE page but not in the prospectus. Include it or not? (The other three are USU, University of Tampa, and UVU.)
5. **Instructors, faculty, or teachers?** The live HE page and the HE prospectus both still say "teachers"; your HE research says "instructors" and "faculty".
6. **HE testimonials.** None exist that are attributed to HE people. Do you have an HE faculty or administrator quote? Can the two anonymous student quotes from the live page be used ("I saw that I was doing much better than I thought I was." / "I spent more time studying for this class than other classes.")? And do the **72%**, **"Fun"**, and Netflix-quote findings come from HE or K-12 students, and is that OK on the HE page?
7. **HE hidden-cost stats.** OK to publish the prospectus's national stats (~1 in 3 don't return for year two; ~40% finish a bachelor's in 4 years)? The DFW card has no number and no citable source: keep it qualitative or drop it? **Answered by 4b-2** (owner approved 2026-09-29): the NCES stats ship without tildes, and the DFW card is dropped.
8. **"Over 125,000 Delphinium enrollments this year"** is in the prospectus but not on v5 or in SOURCE.md. OK for the HE page?
9. **HE video narration.** I couldn't get transcripts. Do any of the six HE videos mention parents? (The live HE Communication copy does.)
10. **Toggle and scope.** Labels "K-12 / Higher Ed"? A URL like `/highered`? SOURCE.md targets **HE Online** programs and excludes campus-only HE. Should the page say "online programs" explicitly?
11. **Screenshots.** The Control Tower detail and `message.png` may visibly show "observers" UI. Recrop or re-shoot for HE?

---

## Working files (uncommitted)
`design-loop/2026-09-28/he-prospectus/`: `highered.html` (raw live HE page), `quote.html` + `bundle.js` (prospectus app), `quote.json` (**contains SLCC pricing; do not commit or publish**), `bundle-strings.txt`, `bundle-extract.txt`, `bundle-extract2.txt`, `hsv-hero.html`, `yt-videos.html`, `thumbs/*.jpg` (HE video posters).
`zoho-sites/assets/he/`: `utah-state-university.png`, `university-of-tampa.jpg`, `utah-valley-university.webp` (from the prospectus CDN).
