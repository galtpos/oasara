# User Testing Simulation

Simulate user testing for this project. Read the persona files in `docs/personas/` to understand our user types.

## Your Task

Simulate **$ARGUMENTS** (or "all personas testing the main user flow" if not specified).

For each persona:
1. **Stay in character** - Think, react, and speak as this person would
2. **Navigate the flow** - Describe what you see, what you try to click, what you expect
3. **Document friction** - Note confusion, frustration, or delight moments
4. **Provide verbatim feedback** - Write quotes as if the user is thinking aloud

## Process

1. First, read all persona files in `docs/personas/`
2. If testing a specific URL, use Playwright MCP to navigate and capture screenshots
3. Simulate each persona's experience step-by-step
4. Document findings in the format below

## Output Format

For each persona, provide:

---

### [Persona Name] - [Scenario Tested]

**First Impression** (0-5 seconds):
> [In-character reaction to landing on the page]

**Task Attempt**:
| Step | Action Tried | Result | Reaction |
|------|--------------|--------|----------|
| 1 | [What they tried] | [What happened] | [Their reaction] |
| 2 | ... | ... | ... |

**Friction Points**:
- 🔴 **Critical**: [Issues that would cause immediate abandonment]
- 🟡 **Moderate**: [Issues causing significant frustration]
- 🟢 **Minor**: [Small annoyances or confusion]

**Delight Moments**:
- ✨ [Things that exceeded expectations]

**Usability Score**: X/10

**Verbatim Feedback**:
> "[Quote as if user is speaking to a friend about the experience]"

**Recommendations** (from user's perspective):
1. [What they wish was different]
2. [What would make them more likely to convert]

---

## After Testing

Provide a summary table:

| Persona | Score | Top Issue | Would Convert? |
|---------|-------|-----------|----------------|
| [Name] | X/10 | [Issue] | Yes/No/Maybe |

And prioritized recommendations based on frequency across personas.
