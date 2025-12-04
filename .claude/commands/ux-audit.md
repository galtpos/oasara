# Full UX Audit with Persona Panel

Conduct a comprehensive UX audit of: **$ARGUMENTS** (or the main application flow if not specified)

## Audit Process

### Phase 1: Load Context

1. Read all persona files from `docs/personas/`
2. If a URL is provided, use Playwright MCP to:
   - Navigate to the page
   - Capture screenshots at desktop, tablet, mobile
   - Extract HTML structure for analysis
   - Run accessibility checks

### Phase 2: Screen-by-Screen Analysis

For each screen/component in the flow:

#### Mini Focus Group Simulation

Simulate a focus group where each persona gives their gut reaction:

> **Alex (Tech)**: "[Immediate reaction]"
> **Patricia (Busy)**: "[Immediate reaction]"
> **Marcus (A11y)**: "[Immediate reaction]"
> **Jennifer (New)**: "[Immediate reaction]"
> **Bob (Senior)**: "[Immediate reaction]"

#### Issue Identification

**Consensus Issues** (3+ personas affected):
- [Issue description]

**Persona-Specific Issues**:
- [Issue] → Affects: [Persona names]

### Phase 3: Prioritization Matrix

| Issue | Impact | Affected Personas | Frequency | Priority |
|-------|--------|-------------------|-----------|----------|
| [Issue] | High/Med/Low | [Names] | All/Most/Some/Few | P0/P1/P2/P3 |

**Priority Definitions**:
- **P0 - Critical**: High impact + affects all users → Fix immediately
- **P1 - High**: High impact + some users OR medium impact + all users → Fix this sprint
- **P2 - Medium**: Medium impact + some users → Add to backlog
- **P3 - Low**: Low impact → Nice to have

### Phase 4: Detailed Findings

For each priority level, document:

#### P0 - Critical Issues
| # | Issue | Location | Personas Affected | Recommendation |
|---|-------|----------|-------------------|----------------|
| 1 | [Issue] | [Component/Page] | [Names] | [How to fix] |

#### P1 - High Priority Issues
[Same format]

#### P2 - Medium Priority Issues
[Same format]

#### P3 - Low Priority Issues
[Same format]

### Phase 5: Recommendations

#### Quick Wins (< 1 hour each)
1. [Change] - Improves experience for [personas]

#### This Sprint
1. [Change] - Addresses [P0/P1 issue]

#### Next Sprint
1. [Change] - Addresses [P1/P2 issue]

#### Future Considerations
1. [Change] - Would benefit [personas] but not urgent

## Output Format

Generate a structured report with:

1. **Executive Summary**
   - Overall UX Score: X/100
   - Critical issues count
   - Top 3 recommendations

2. **Persona Impact Summary**
   | Persona | Experience Rating | Key Blocker | Key Delight |
   |---------|-------------------|-------------|-------------|

3. **Detailed Findings** (organized by priority)

4. **Actionable Recommendations** (organized by effort)

5. **Appendix**
   - Screenshots captured
   - Accessibility scan results
   - Raw persona reactions

This report should be suitable for sharing with stakeholders and product teams.
