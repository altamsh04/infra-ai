# InfraAI

**AI-powered System Design Assistant**

InfraAI is an interactive web application that helps you design modern cloud and software architectures using AI. Describe your system requirements in natural language, and InfraAI will recommend, explain, and visually organize the best-fit components for your needs.

## Features

- **Conversational System Design**: Chat with an AI architect to describe your requirements and get tailored architecture recommendations.
- **Visual Architecture Canvas**: Instantly visualize your system as a drag-and-drop diagram, grouped by logical layers (Frontend, Backend, Database, Networking, etc.).
- **Rich Component Library**: Choose from 50+ real-world components (load balancers, databases, queues, security, ML, DevOps, and more).
- **AI-Powered Explanations**: Get clear, concise explanations for each recommended component and connection.
- **Modern UI/UX**: Built with React, Next.js, Tailwind CSS, and React Flow for a seamless, interactive experience.

## Prerequisites

Before you begin, ensure you have:
- Node.js 20.x or later
- npm, yarn, pnpm, or bun package manager
- Access to the following services:
  - [Google AI Studio](https://makersuite.google.com/app/apikey) for Gemini API key
  - [Clerk Dashboard](https://dashboard.clerk.dev/) for authentication
  - [Supabase Dashboard](https://app.supabase.com/) for database

## Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/altamsh04/infra-ai.git
cd infra-ai

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Environment Configuration

1. **Copy the sample environment file:**
   ```bash
   cp env.sample .env
   ```

2. **Configure your environment variables:**

   ```env
   # AI Configuration
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here

   # Database (Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

3. **Get your API keys:**
   - **Gemini API Key**: 
     1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
     2. Create a new API key
     3. Copy it to `NEXT_PUBLIC_GEMINI_API_KEY`

   - **Clerk Keys**:
     1. Create a project at [Clerk Dashboard](https://dashboard.clerk.dev/)
     2. Go to API Keys section
     3. Copy Publishable Key to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     4. Copy Secret Key to `CLERK_SECRET_KEY`

   - **Supabase Configuration**:
     1. Create a project at [Supabase Dashboard](https://app.supabase.com/)
     2. Go to Project Settings > API
     3. Copy Project URL to `NEXT_PUBLIC_SUPABASE_URL`
     4. Copy anon/public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     5. Copy service_role key to `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Setup

1. **Initialize Supabase Tables:**
   ```sql
   -- User credits table
   create table user_credits (
     id uuid default uuid_generate_v4() primary key,
     clerk_id text not null unique,
     credits int not null default 10,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable Row Level Security
   alter table user_credits enable row level security;
   ```

## Running the Application

### Local Development

```bash
# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

#### Using Docker Compose (Recommended)

1. **Ensure environment variables are set in `.env`**

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application at [http://localhost:3000](http://localhost:3000)**

#### Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t infra-ai .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 --env-file .env infra-ai
   ```

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
- **Clerk** (for authentication)
- **Supabase** (for database)

## Project Structure

- `src/app/` – Next.js app, pages, and system component data
- `src/components/` – UI components (Chat, Canvas, Nodes, etc.)
- `src/lib/` – AI logic and utilities

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, new features, or improvements.

## License

MIT
