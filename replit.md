# EcoFinds - Second-Hand Marketplace Platform

## Overview

EcoFinds is a sustainable marketplace application that enables users to buy and sell second-hand items, promoting circular economy and conscious consumption. The platform combines a React-based frontend with an Express.js backend, featuring user authentication via Replit's OIDC, product listings with categories and search capabilities, shopping cart functionality, and order management. The application is designed to be fully responsive, working seamlessly on both desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Authentication Flow**: Protected routes based on authentication state, with automatic redirects to Replit OIDC login

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Authentication**: Passport.js with Replit OIDC strategy for seamless integration with Replit's authentication system
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Design**: Normalized relational schema with tables for users, products, categories, cart items, orders, and order items
- **Session Storage**: Dedicated sessions table for persistent login state

### Authentication and Authorization
- **Provider**: Replit OIDC (OpenID Connect) for user authentication
- **Session Strategy**: Server-side sessions with secure HTTP-only cookies
- **Authorization Pattern**: Middleware-based route protection with automatic token refresh
- **User Management**: Profile creation and editing with username, bio, and address information

### API Structure
- **Authentication Routes**: `/api/auth/*` for user profile management and authentication status
- **Product Routes**: `/api/products/*` for CRUD operations, search, and filtering
- **Category Routes**: `/api/categories` for product categorization
- **Cart Routes**: `/api/cart/*` for shopping cart management
- **Order Routes**: `/api/orders/*` for purchase history and order processing

### Key Features Implementation
- **Product Management**: Full CRUD operations with image placeholders, categories, and condition tracking
- **Search and Filtering**: Keyword search in titles and category-based filtering
- **Shopping Cart**: Persistent cart with quantity management and automatic user association
- **Responsive Design**: Mobile-first design with dedicated mobile navigation and adaptive layouts
- **Error Handling**: Comprehensive error boundaries with user-friendly error messages and automatic retry mechanisms

## External Dependencies

### Core Technologies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **Backend Framework**: Express.js with TypeScript support via tsx
- **Database**: Neon PostgreSQL with Drizzle ORM and Drizzle Kit for migrations
- **Authentication**: Passport.js with OpenID Client for Replit OIDC integration

### UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling, class-variance-authority for component variants

### Development and Build Tools
- **Build System**: Vite with React plugin for fast development and optimized production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **Validation**: Zod for runtime type validation and schema definition
- **Development**: Replit-specific plugins for enhanced development experience

### Hosting and Infrastructure
- **Database Hosting**: Neon for serverless PostgreSQL
- **Authentication Provider**: Replit OIDC for seamless user authentication
- **Session Storage**: PostgreSQL-backed session store for scalable session management
- **WebSocket Support**: ws library for Neon database connections