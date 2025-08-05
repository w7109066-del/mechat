# Overview

This is a modern full-stack chat application called "ChatMe" built with React (frontend) and Express.js (backend). The application provides real-time messaging capabilities with friend management, chat rooms, and user profiles. It features a mobile-responsive design with a native app-like interface, including welcome screens, authentication flows, and intuitive navigation.

The application supports direct messaging between friends, group chat rooms, user status management, and profile customization. It's designed as a social messaging platform with modern UI components and smooth user interactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build System**: Vite with TypeScript, supports hot module replacement and development optimizations

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js integration
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with structured route handlers and middleware

## Database Schema
- **Users Table**: Stores user profiles with authentication data, online status, and profile information
- **Friendships Table**: Manages friend relationships with status tracking (pending, accepted, blocked)
- **Messages Table**: Stores all chat messages with sender, recipient, room association, and timestamps
- **Chat Rooms Table**: Manages group chat rooms with metadata and member lists
- **Room Members Table**: Junction table for room membership management
- **Sessions Table**: Required for Replit Auth session persistence

## Authentication & Authorization
- **Provider**: Replit OpenID Connect for seamless authentication within Replit environment
- **Session Handling**: HTTP-only cookies with PostgreSQL-backed session storage
- **Middleware**: Protected route middleware that validates authentication state
- **User Management**: Automatic user creation/updates on successful authentication

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect for database operations
- **@tanstack/react-query**: Server state management and caching for API calls
- **express-session**: Session middleware with PostgreSQL store integration
- **passport**: Authentication middleware with OpenID Connect strategy

### UI & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework with custom design system
- **class-variance-authority**: Type-safe component variant management
- **lucide-react**: Modern icon library for consistent iconography

### Development Tools
- **typescript**: Type safety across frontend and backend
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for Node.js development
- **esbuild**: Fast bundling for production builds

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling integration
- **openid-client**: OIDC client for Replit authentication flow