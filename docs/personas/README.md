# User Persona System

This directory contains user personas for simulating realistic user testing and feedback.

## Purpose

User personas help us:
- Test features from multiple perspectives before shipping
- Identify accessibility and usability issues early
- Prioritize fixes based on user impact
- Make data-informed design decisions

## How to Use

### Quick Commands

```bash
# Run user test simulation
/project:user-test "complete a facility search"

# Get multi-persona feedback on a component
/project:persona-review "the search filter panel"

# Full UX audit with all personas
/project:ux-audit "homepage to booking flow"

# Generate a new persona
/project:generate-persona "medical tourist from Europe seeking dental work"
```

### Persona Files

Each persona is defined in a YAML file with:
- **Demographics**: Age, occupation, location, income
- **Technical Profile**: Tech savviness, devices, accessibility needs
- **Psychographics**: Goals, frustrations, motivations, values
- **Behavioral Patterns**: Browsing habits, patience levels
- **Context**: When/where/how they use the product
- **Voice**: Communication style and example quotes

## Default Personas

| Persona | Key Trait | Primary Use Case |
|---------|-----------|------------------|
| `tech-savvy-millennial` | High expectations, low patience | Power user flows |
| `busy-professional` | Time-constrained, needs efficiency | Quick task completion |
| `accessibility-user` | Screen reader, keyboard nav | Accessibility testing |
| `first-time-visitor` | No context, skeptical | Onboarding, trust signals |
| `non-technical-senior` | Cautious, needs guidance | Clarity, error recovery |

## Adding New Personas

1. Copy `persona-template.yaml`
2. Fill in all fields with realistic, specific details
3. Save as `[descriptive-name].yaml`
4. Test with `/project:user-test` to validate

## Best Practices

- **Be specific**: "Uses iPhone 12 with VoiceOver" not "uses mobile"
- **Include quotes**: Real-sounding phrases help stay in character
- **Consider edge cases**: What unique scenarios might this user face?
- **Update regularly**: Personas should evolve with user research
