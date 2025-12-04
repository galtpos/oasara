# Persona-Based Code/Design Review

Review the specified component or flow from multiple user perspectives.

## Focus Area

$ARGUMENTS (or "general usability" if not specified)

## Process

1. Load all personas from `docs/personas/`
2. For each persona, evaluate the component/flow through their lens
3. Identify both issues and positive aspects
4. Provide actionable recommendations

## For Each Persona, Answer:

### 1. Would this user understand this?
**Clarity Check**
- Is the purpose immediately clear?
- Are labels and instructions understandable?
- Is there jargon that would confuse them?

### 2. Would this user trust this?
**Credibility Check**
- Does it look professional/legitimate?
- Are there sufficient trust signals?
- Would anything trigger skepticism?

### 3. Would this user complete this task?
**Usability Check**
- Can they physically interact with it? (accessibility)
- Is the flow intuitive for their experience level?
- Are there too many steps?

### 4. What would frustrate this user?
**Friction Check**
- Specific pain points for this persona
- Missing features they'd expect
- Interaction patterns that don't match their habits

### 5. What would delight this user?
**Positive Moments**
- Features that exceed expectations
- Thoughtful touches they'd notice
- Things that make their specific task easier

## Output Format

### [Component/Flow Name] - Multi-Persona Review

#### Summary Matrix

| Persona | Clarity | Trust | Usability | Friction | Delight |
|---------|---------|-------|-----------|----------|---------|
| Alex (Tech) | ✅/⚠️/❌ | ... | ... | ... | ... |
| Patricia (Busy) | ... | ... | ... | ... | ... |
| Marcus (A11y) | ... | ... | ... | ... | ... |
| Jennifer (New) | ... | ... | ... | ... | ... |
| Bob (Senior) | ... | ... | ... | ... | ... |

#### Detailed Findings by Persona

[Detailed responses for each persona]

#### Consensus Issues
Issues that affect 3+ personas (highest priority):
1. [Issue affecting multiple personas]

#### Persona-Specific Issues
Issues affecting only certain user types:
1. [Issue] - Affects: [Persona names]

#### Recommendations
Prioritized list of changes with expected impact.
