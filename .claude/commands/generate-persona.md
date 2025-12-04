# Generate New User Persona

Create a new user persona based on: **$ARGUMENTS**

## Process

1. Read the template from `docs/personas/persona-template.yaml`
2. Create a realistic, specific persona based on the description
3. Save to `docs/personas/[descriptive-name].yaml`

## Persona Requirements

Make the persona **realistic and specific**:

### Demographics
- Give them a full name that feels authentic
- Specific age (not a range)
- Realistic occupation with context
- Specific location (city, state/country)
- Concrete income level

### Technical Profile
- Specific devices they own (brand/model)
- Actual browser they'd use
- Detailed accessibility needs if applicable
- Tech savviness with justification

### Psychographics
- 3-5 specific goals related to medical tourism
- 5+ realistic frustrations (be specific!)
- Clear motivations for seeking care abroad
- Values that drive their decisions

### Behavioral Patterns
- How do they actually browse the web?
- What's their patience threshold?
- What makes them abandon a site?

### Voice
- 5+ example quotes that capture their personality
- Quotes should feel like real things real people say
- Include both positive and negative reactions

## Test Scenarios

After creating the persona, suggest 3 test scenarios specifically designed for this user type:

1. **[Scenario Name]**: [Description of what to test and why it matters for this persona]
2. **[Scenario Name]**: [Description]
3. **[Scenario Name]**: [Description]

## Output

1. Full persona YAML file saved to `docs/personas/`
2. Summary of the persona's key characteristics
3. Three tailored test scenarios
4. Suggestions for when to use this persona in testing
