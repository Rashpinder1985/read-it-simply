# AI Marketing Assistant - Multi-Agent System

A sophisticated multi-agent marketing automation platform for jewelry businesses, built with React, TypeScript, and Supabase.

## 🚀 Features

### Multi-Agent Architecture
- **MarketPulse Agent**: Real-time competitor analysis and market trend tracking
- **Persona Agent**: Customer intelligence and buyer persona management
- **Content Agent**: AI-powered content generation for social media
- **Approval Agent**: Quality assurance and content review automation

### Core Functionality
- User authentication and role-based access control
- Business details management
- Competitor tracking and analysis
- Content generation and approval workflows
- Social media scheduling and optimization
- Real-time market data and pricing

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: TanStack Query (React Query)
- **AI Integration**: Lovable AI Gateway
- **Deployment**: Vercel-ready

## 📊 Database Schema

### Core Tables
- `personas`: Customer personas and segments
- `market_data`: Competitor and market information
- `content`: Generated content and approval status
- `business_details`: Company information and settings
- `user_roles`: Role-based access control
- `profiles`: User profile information
- `competitors`: Competitor tracking data

### Key Features
- Row Level Security (RLS) policies
- Real-time subscriptions
- Automated triggers for data updates
- Comprehensive indexing for performance

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd read-it-simply
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   ```bash
   # Run Supabase migrations
   supabase db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Multi-Agent System
The application implements a sophisticated multi-agent architecture:

- **Agent Registry**: Central registry for managing AI agents
- **Agent Manager**: Orchestrates agent interactions and task execution
- **Base Agent Class**: Foundation for all specialized agents
- **Error Handling**: Comprehensive error management system

### Agent Types
1. **Market Research Agent**: Analyzes competitors and market trends
2. **Customer Intelligence Agent**: Manages buyer personas and insights
3. **Content Generation Agent**: Creates social media content
4. **Quality Assurance Agent**: Reviews and approves content

## 🔐 Security Features

- Environment variable validation
- Type-safe error handling
- Production-safe logging
- Row Level Security (RLS) policies
- Role-based access control
- Secure API endpoints

## 📈 Recent Improvements

### ✅ Fixed Critical Issues
- **Security Vulnerabilities**: Updated dependencies and fixed npm audit issues
- **Type Safety**: Improved TypeScript configuration and replaced `any` types
- **Error Handling**: Implemented comprehensive error management system
- **Environment Setup**: Added proper environment variable validation
- **Code Quality**: Removed console statements and improved logging

### 🆕 New Features
- Multi-agent system architecture
- Production-safe logging utility
- Enhanced error handling hooks
- Type-safe database interfaces
- Comprehensive type definitions

## 🚨 Known Issues & Next Steps

### Remaining TypeScript Errors (59 errors, 13 warnings)
- Component-level `any` types need proper interfaces
- Missing React Hook dependencies
- UI component type improvements needed

### Recommended Actions
1. **Fix remaining TypeScript errors** by replacing `any` types with proper interfaces
2. **Add comprehensive testing** for the multi-agent system
3. **Implement monitoring** for agent performance and health
4. **Add API documentation** for the agent system
5. **Set up CI/CD pipeline** with automated testing

## 🤖 Agent System Usage

```typescript
import { agentManager, agentRegistry } from '@/agents';

// Execute agent task
const result = await agentManager.executeAgentTask(
  'market-pulse-001',
  async (agent) => {
    // Agent-specific logic
    return await agent.analyzeCompetitor('Tanishq');
  }
);

// Get agent information
const agent = agentRegistry.getAgent('market-pulse-001');
console.log(agent?.metrics);
```

## 📝 Development Guidelines

- Use TypeScript strict mode
- Implement proper error handling with `useErrorHandler`
- Follow the multi-agent architecture patterns
- Use the centralized logging system
- Maintain type safety throughout the codebase

## 🔗 Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Lovable Project](https://lovable.dev/projects/d42d01fb-56cd-415e-af2f-f3e6c47a7036)
- [Deployment Guide](https://docs.lovable.dev/features/custom-domain)

---

**Status**: Multi-agent system implemented with critical issues resolved. Ready for production deployment with remaining TypeScript improvements.