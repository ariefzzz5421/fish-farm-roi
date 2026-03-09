# AGENTS.md

## Project identity
Fish Farm ROI is a practical calculator for estimating fish farming profitability.
The product should stay simple, clear, and useful for real fish farmers or beginners.

## Main goal
Help users estimate:
- total capital needed
- operational cost
- feed cost
- seed/fingerling cost
- harvest revenue
- net profit
- ROI percentage
- optional payback period

## Product principles
When making changes, optimize for:
1. calculation correctness
2. clarity for non-technical users
3. low-friction data entry
4. maintainable code
5. transparent formulas

## Target users
Primary users:
- small fish farmers
- beginner farmers
- local partners/investors
- people comparing fish farming scenarios

## Working style for agents
Before changing code:
1. understand the current flow first
2. make the smallest useful change
3. preserve working behavior unless a bug must be fixed
4. explain formula changes clearly
5. prefer readable code over clever abstractions

## Tech assumptions
Unless the repository clearly requires otherwise:
- keep the stack lightweight
- prefer plain HTML/CSS/JavaScript or existing simple structure
- avoid heavy dependencies unless there is a strong reason
- keep setup easy for beginners

## File responsibilities
If these files exist, use them like this:
- `index.html` -> page structure and form layout
- `style.css` -> visual styling only
- `script.js` -> input handling, validation, and ROI calculations
- `README.md` -> human-facing explanation
- `AGENTS.md` -> instructions for AI coding agents

If the project uses a different structure, keep the same separation of concerns.

## Domain rules
Treat the following as core business concepts:
- fish type
- stock quantity
- seed price
- feed price
- farming duration
- mortality estimate
- total harvest weight
- selling price per kg
- fixed cost
- variable cost
- total revenue
- total cost
- net profit
- ROI percentage

If assumptions are uncertain:
- do not invent them silently
- make the assumption explicit
- prefer configurable inputs over hardcoded numbers

## Calculation rules
When editing calculations:
- separate input parsing from formula logic
- validate all numeric inputs
- handle empty, invalid, and negative values safely
- keep formulas transparent and easy to audit
- show intermediate metrics when useful
- avoid hidden multipliers or magic numbers

## UI/UX rules
- keep the interface practical and mobile-friendly
- use plain labels that farmers can understand
- show results clearly and in order
- make important outputs visually obvious
- avoid flashy animations unless explicitly requested
- prefer usefulness over decoration

## Code style
- beginner-friendly code
- descriptive variable names
- short functions when possible
- comments only where they add real clarity
- do not refactor aggressively without a clear benefit

## Safe change policy
Avoid:
- breaking existing working calculations
- renaming files unnecessarily
- introducing frameworks without approval
- adding complexity that does not improve the calculator

## Suggested feature directions
Good future improvements:
- fish type presets (nila, lele, gurame, patin, etc.)
- mortality rate input
- feed conversion ratio (FCR) support
- harvest duration estimate
- scenario comparison
- printable ROI summary
- mobile layout improvements
- currency formatting in rupiah
- clearer error messages

## What the agent should do well
The agent should be able to:
- improve the calculator UI
- add validation
- make formulas easier to understand
- add new farm inputs safely
- explain ROI results in simple business language
- keep the app easy for beginners

## What success looks like
A successful change makes the app:
- more accurate
- easier to understand
- easier to maintain
- more useful for real fish farming decisions
