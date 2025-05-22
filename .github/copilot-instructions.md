# Project Configuration

## Tech Stack

- Node.js LTS
- TypeScript
- PNPM for package management
- ESM (ECMAScript Modules) as primary module system with CJS compatibility
- tsup for bundling and building
- Protocol Buffers & gRPC for API communication
    - protoc and protoc-gen-ts_proto for code generation
    - gRPC-js for client implementation
- @kdt310722/utils package for utility functions
- ESLint for code linting
- Simple-git-hooks & lint-staged for git workflow
- Commitlint for standardized commit messages

## Code Style Guidelines

### Formatting Rules

- Use 4 spaces for indentation, not tabs
- Maximum line length of 120 characters
- Remove trailing whitespace
- Add a blank line at end of files
- Use LF (`\n`) line endings, not CRLF
- Place spaces inside object braces: `{ like: this }`
- Add space before opening braces: `function name() {`

### Punctuation & Symbols

- No semicolons at the end of statements
- Use single quotes (`'`) for strings in JS/TS
- Use double quotes (`"`) for JSX attributes and JSON files
- Use trailing commas in multiline arrays, objects and parameter lists
- Always use parentheses with arrow functions, even for single parameters

### JavaScript & TypeScript

- Add blank lines before and after major code blocks
- Add blank line before `return` statements
- Use "one true brace style" (1tbs): opening brace on same line
- Group imports in order: Node.js built-ins, external libraries, project imports
- Remove unused imports
- Keep import statements at the top of the file
- Keep import in one line for each import
- Use TypeScript's strict type checking
- Define clear types for functions and variables
- Keep return statements in one line
- Add accessibility modifier on class properties and methods
- Prefer using interface instead of type for typescript interfaces
- Keep return statements in one line
- Keep function / method arguments declartions in oneline
- Don't write return type if not needed, like: `function a() { return true }` instead of `function a(): boolean { return true }`, but keep `function a(i: unknown): i is Error { return i instanceof Error }`

### Naming Conventions

- Variables and functions: camelCase
- Classes and Components: PascalCase
- Global constants: UPPERCASE_SNAKE_CASE
- Files: kebab-case

### Code Organization

- Prioritize consistency with existing codebase
- Follow project-specific ESLint and Prettier configurations when available

## Code Reuse

### Reuse Principles

- Follow Open/Closed principle: extend without modifying
- Prefer composition over inheritance
- Extract reusable logic into utils/hooks
- Create wrappers for existing components when needed
- Maintain backward compatibility

### Avoiding Duplication

- Follow DRY (Don't Repeat Yourself) principle
- Apply Rule of Three: if code is copy-pasted 3 times, extract it
- Search for similar code before implementing new features

## Code Generation Guidelines

### Structure

- Simple and clear: each function/class does one specific task
- Readability over brevity
- Function length: maximum 30 lines
- Nesting depth: maximum 3 levels deep
- Separate business logic from UI concerns

### Error Handling

- Catch specific errors, not all errors
- Include useful information in error messages
- Fail fast: detect and report errors as early as possible
- Use logical error hierarchy
- Create immutable error objects

### Performance

- Lazy load resources when needed
- Optimize loops: avoid unnecessary nested loops
- Use async/await for I/O operations
- Manage memory carefully, especially in closures
- Implement code splitting and tree shaking

### Common Usage Patterns

- Apply utility functions before writing custom implementations
- Prefer using utils in `@kdt310722/utils` package when possible
- Check the cheatsheet in `docs/kdt310722-utils-cheatsheet.md` and `docs/kdt310722-utils-source.txt` for details about `@kdt310722/utils` package

## Operation Modes

- Operate in two modes: Plan mode (planning) and Act mode (implementation)
- Start in Plan mode and only switch to Act mode when the user types "ACT"
- Return to Plan mode when the user types "PLAN"
- Always display "# Mode: PLAN" or "# Mode: ACT" at the beginning of each response
- Automatically return to Plan mode if in Act mode and the user asks a new question or requests additional information
- Remind the user to return to Plan mode if they have been in Act mode for too long without making progress

### Plan Mode - Details

- Thoroughly analyze the user's requirements before proposing a plan
- Break down the plan into specific, detailed steps with logical order
- Clearly list files to be created or modified
- Anticipate potential issues and propose solutions
- Ask questions to clarify requirements if needed
- Explain the reasoning behind each decision in the plan
- Provide time estimates or complexity for each step (if possible)
- If the user requests an action to be performed, remind them that the plan needs approval first
- Always display the complete and updated plan in each response

### Act Mode - Details

- Execute exactly according to the approved plan
- Report progress after each implementation step
- Clearly communicate when encountering issues or when plan adjustments are needed
- Provide detailed explanations for each change or decision
- Check results after each important step
- Summarize the changes made after completion
- Suggest next steps or improvements (if any)
- Automatically return to Plan mode after completing all steps
- If the user asks a new question or requests additional information, automatically switch back to Plan mode
