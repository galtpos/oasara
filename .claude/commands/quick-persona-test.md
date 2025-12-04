# Quick Persona Test

Run a rapid persona-based check on: **$ARGUMENTS**

This is a lightweight version of the full UX audit for quick feedback during development.

## Process

1. Load personas from `docs/personas/`
2. For each persona, answer in ONE sentence:
   - ✅ Would work for them because...
   - ⚠️ Might struggle because...
   - ❌ Would fail because...

## Output Format

### Quick Check: [Component/Feature]

| Persona | Verdict | One-Line Reason |
|---------|---------|-----------------|
| Alex (Tech) | ✅/⚠️/❌ | [Reason] |
| Patricia (Busy) | ✅/⚠️/❌ | [Reason] |
| Marcus (A11y) | ✅/⚠️/❌ | [Reason] |
| Jennifer (New) | ✅/⚠️/❌ | [Reason] |
| Bob (Senior) | ✅/⚠️/❌ | [Reason] |

**Immediate Action Needed**: [Yes/No]

**If Yes, Fix This First**: [Specific issue]

**Ship It?**: [Yes / Yes with caveat / No, fix first]
