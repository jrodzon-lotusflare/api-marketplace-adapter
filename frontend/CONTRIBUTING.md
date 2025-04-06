# Contributing to API Configurator

Thank you for your interest in contributing to this project! Here's how you can help.

## Development Workflow

1. **Fork the repository** (if you're an external contributor)
2. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/api-configurator.git
   cd api-configurator
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make your changes**
   - Follow the existing code style
   - Write clear, concise commit messages
   - Add comments for complex logic

6. **Test your changes**
   ```bash
   npm run dev
   ```

7. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

8. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create a pull request** from your branch to the main repository

## Commit Message Guidelines

We follow a simplified version of the conventional commits standard:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that don't affect code (formatting, etc.)
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `test:` - Adding or modifying tests
- `chore:` - Changes to build process or auxiliary tools

Example: `feat: Add CAMARA API repository integration`

## Code Style

- Use 2 spaces for indentation
- Follow the ESLint rules configured in the project
- Use TypeScript features appropriately
- Use functional components with hooks for React
- Group related functions and keep files manageable in size

## Project Structure

- `src/components/` - React components
- `src/services/` - Services for API calls and business logic
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/hooks/` - Custom React hooks

## Backend Development

When implementing the server-side functionality:

1. Create a separate directory for the server code
2. Use appropriate authentication and error handling
3. Document API endpoints with examples
4. Implement proper logging and monitoring

## Questions?

If you have any questions or need help, please open an issue on the repository. 