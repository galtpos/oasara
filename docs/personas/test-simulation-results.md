# User Testing Simulation Results

**Date**: 2025-12-03
**URL Tested**: https://oasarademo.netlify.app
**Scenario**: First-time visit to homepage, exploring facilities

---

## Alex Chen (Tech-Savvy Millennial)

**First Impression** (0-5 seconds):
> "Clean design, not cluttered. 518 facilities is impressive. Let me see if the filters are any good."

**Task Attempt**:
| Step | Action Tried | Result | Reaction |
|------|--------------|--------|----------|
| 1 | Scanned header | Saw navigation, stats bar | "Good info density. Skip link - nice, they care about a11y." |
| 2 | Looked at map | Interactive Mapbox with clusters | "Oh this is smooth. Clustering works well." |
| 3 | Tried search | Focused, saw suggestions appear | "Autocomplete suggestions are helpful." |
| 4 | Checked filters | Country/Specialty/Zano dropdowns | "Multi-select would be better but this works." |
| 5 | Scrolled facility cards | Saw prices, procedures, ratings | "All the info I need at a glance. Price transparency - rare." |

**Friction Points**:
- 🟡 **Moderate**: "0 facilities accept Zano payment" - the main selling point shows zero? That's concerning.
- 🟢 **Minor**: Can't sort by rating or price
- 🟢 **Minor**: Would like keyboard shortcuts for power users

**Delight Moments**:
- ✨ Fast load time, no jank
- ✨ Skip link actually works (tested with Tab)
- ✨ Price ranges clearly visible on cards
- ✨ Clean focus indicators

**Usability Score**: 8/10

**Verbatim Feedback**:
> "This is actually one of the better medical tourism sites I've seen. Clean, fast, shows prices upfront. I'm a bit confused why they're pushing Zano so hard when literally zero facilities accept it though. Fix that and I'd trust this."

**Recommendations**:
1. Add sorting options (price, rating, distance)
2. Enable Zano on at least some facilities
3. Add keyboard shortcuts (J/K to navigate cards)

---

## Marcus Thompson (Accessibility User)

**First Impression** (0-5 seconds):
> "Skip link activated, jumped to main content. Good start. Let me check the heading structure."

**Task Attempt**:
| Step | Action Tried | Result | Reaction |
|------|--------------|--------|----------|
| 1 | Pressed Tab | Skip link appeared and worked | "Great, skip link is functional." |
| 2 | Navigated headings (H key) | H1 OASARA, then H2 Legend | "Good - they fixed the heading hierarchy." |
| 3 | Explored map region | Heard aria-label about map | "Nice - they describe what the map shows." |
| 4 | Used search input | Screen reader announced label | "Properly labeled. aria-describedby for suggestions." |
| 5 | Tabbed through cards | Focus visible, buttons accessible | "Can interact with everything via keyboard." |

**Friction Points**:
- 🟡 **Moderate**: Map itself isn't keyboard navigable - can focus container but can't interact with markers
- 🟡 **Moderate**: Would like a text-based list of all facilities as alternative to map
- 🟢 **Minor**: Some icons might not have sufficient alt text

**Delight Moments**:
- ✨ Skip link works perfectly
- ✨ Focus indicators are clear (gold outline, high contrast)
- ✨ Screen reader announcements for facility count
- ✨ Proper form labels with aria-describedby

**Usability Score**: 7.5/10

**Verbatim Feedback**:
> "This is refreshingly accessible for a medical site. Most healthcare websites are nightmares. The skip link works, headings make sense, I can navigate the cards. The map is my only real blocker - I can't interact with it, but the card list gives me the same info."

**Recommendations**:
1. Add keyboard navigation for map markers
2. Provide a "List View" toggle as map alternative
3. Add more detailed alt text to facility images

---

## Jennifer Walsh (First-Time Visitor)

**First Impression** (0-5 seconds):
> "OASARA... what is that? 518 facilities in 39 countries - okay, it's a directory. JCI Accredited - I should google what that means."

**Task Attempt**:
| Step | Action Tried | Result | Reaction |
|------|--------------|--------|----------|
| 1 | Read header | Saw unfamiliar terms (Zano) | "Why Zano? What is Zano? I'm already confused." |
| 2 | Looked at map | Pretty but overwhelming | "So many dots. Where do I even start?" |
| 3 | Scrolled to cards | Saw hospital names, locations, prices | "Okay, these look like real hospitals. Prices are way lower than US." |
| 4 | Looked for reviews | Saw "(0)" on most facilities | "No reviews? How do I know these are good?" |
| 5 | Searched for explanation | Couldn't find an "About" or "How it works" | "I still don't understand what this site does exactly." |

**Friction Points**:
- 🔴 **Critical**: No onboarding or explanation of what Oasara is/does
- 🔴 **Critical**: Most facilities show (0) reviews - no social proof
- 🟡 **Moderate**: "Zano" mentioned everywhere but never explained
- 🟡 **Moderate**: No FAQ or "How it works" section visible

**Delight Moments**:
- ✨ Prices clearly shown (transparency builds trust)
- ✨ JCI Certified badges on cards
- ✨ Professional, modern design

**Usability Score**: 5/10

**Verbatim Feedback**:
> "The site looks professional, which helps. But I have no idea what Oasara is, what Zano is, or why I should trust this. Most hospitals have zero reviews which is a red flag. I'd google 'Is Oasara legit' before doing anything here."

**Recommendations**:
1. Add a clear value proposition on homepage ("Save 60-80% on procedures abroad")
2. Add "How it works" or "About" section
3. Explain what Zano is or remove prominent mentions
4. Prioritize showing facilities WITH reviews first

---

## Summary

| Persona | Score | Top Issue | Would Convert? |
|---------|-------|-----------|----------------|
| Alex (Tech) | 8/10 | No sorting, Zano shows 0 | Maybe - needs more research |
| Marcus (A11y) | 7.5/10 | Map not keyboard navigable | Yes - with card list |
| Jennifer (New) | 5/10 | No explanation of what Oasara is | No - needs trust signals |

## Prioritized Recommendations

### P0 - Critical (Fix Immediately)
1. **Add onboarding content** - Explain what Oasara is for first-time visitors
2. **Fix "0 facilities accept Zano"** - Either enable Zano or hide this until ready

### P1 - High Priority (This Sprint)
1. **Add sorting** - By rating, price, country
2. **Surface reviews** - Show facilities with reviews first
3. **Explain Zano** - Add tooltip or link to explanation

### P2 - Medium Priority (Backlog)
1. **Map keyboard navigation** - For accessibility users
2. **List view toggle** - Alternative to map
3. **FAQ section** - Common questions for first-timers

### P3 - Nice to Have
1. Keyboard shortcuts for power users
2. Dark mode
3. Comparison feature
