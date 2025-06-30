# InfraAI

**AI-powered System Design Assistant**

InfraAI is an interactive web application that helps you design modern cloud and software architectures using AI. Describe your system requirements in natural language, and InfraAI will recommend, explain, and visually organize the best-fit components for your needs.

## Features

- **Conversational System Design**: Chat with an AI architect to describe your requirements and get tailored architecture recommendations.
- **Visual Architecture Canvas**: Instantly visualize your system as a drag-and-drop diagram, grouped by logical layers (Frontend, Backend, Database, Networking, etc.).
- **Rich Component Library**: Choose from 50+ real-world components (load balancers, databases, queues, security, ML, DevOps, and more).
- **AI-Powered Explanations**: Get clear, concise explanations for each recommended component and connection.
- **Modern UI/UX**: Built with React, Next.js, Tailwind CSS, and React Flow for a seamless, interactive experience.

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

2. **Set up your Gemini API key:**
   - Create a `.env.local` file in the project root.
   - Add your Gemini API key:
     ```env
     NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
     ```

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Usage

- Start a conversation in the chat panel (left side) by describing your system (e.g., "Design a scalable e-commerce platform with cache, search, and payment integration").
- The AI will recommend and explain a set of components, grouped by function.
- The right panel visualizes the architecture as an interactive diagram. Hover or click components for more details.
- You can iterate on your requirements and see the architecture update in real time.

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **React 19**
- **Tailwind CSS**
- **React Flow** (for diagrams)
- **Google Gemini API** (for AI recommendations)

## Project Structure

- `src/app/` – Next.js app, pages, and system component data
- `src/components/` – UI components (Chat, Canvas, Nodes, etc.)
- `src/lib/` – AI logic and utilities

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, new features, or improvements.

## License

MIT
