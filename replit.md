# Replit.md - Material Inventory Management System

## Overview

This project is a full-stack material inventory management system designed for small to medium-sized fashion industry businesses. It enables users to efficiently manage materials, track inventory levels, monitor stock status, and analyze consumption patterns. The system provides a modern, mobile-friendly interface, comprehensive analytics, and robust user management, aiming to optimize material flow and reduce costs for manufacturing businesses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state, React hooks for UI state
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Theme**: Light/dark mode support

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon Database)
- **ORM**: Drizzle ORM
- **API Design**: RESTful API with JSON responses
- **Validation**: Zod schemas (shared with frontend)
- **Session Management**: Express sessions with PostgreSQL store

### Key Features
- **Material Management**: CRUD operations for materials with enhanced fields (e.g., dateOfPurchase, supplierName).
- **Inventory Tracking**: Real-time stock level monitoring, low stock alerts, and customizable notification thresholds.
- **Analytics & Reporting**: Comprehensive dashboard with interactive charts for stock distribution, usage trends, and production efficiency. Includes inventory statistics and material consumption tracking (COGS).
- **User Management**: Role-based access control (admin, manager, employee, viewer) with granular permissions, authentication (bcrypt, sessions), and user management dashboard.
- **Settings Management**: Configurable user profiles, notification preferences, inventory settings, display options, and data management (export).
- **Help & Documentation**: Interactive wiki, getting started guide, feature deep dives, and contextual help, all mobile-optimized.
- **Search & Filtering**: Advanced filtering by category, stock level, supplier, date range, quantity, and comprehensive sorting capabilities.
- **Internationalization**: Support for English and Indonesian languages.
- **Mobile-First Design**: Responsive interface and dedicated mobile navigation.

### Data Flow
User interactions trigger API calls managed by TanStack Query. The Express backend handles requests, validates data with Zod, and performs database operations via Drizzle ORM. Responses update the UI.

### Key Architectural Decisions
- **Monorepo with Shared Types**: Ensures type safety across the full stack.
- **Drizzle ORM**: Provides type-safe database operations.
- **TanStack Query**: Manages server state effectively with caching and synchronization.
- **Radix UI + Tailwind CSS**: Combines accessibility with modern, utility-first styling.
- **Zod Validation**: Shared schemas for robust, consistent validation.
- **Mobile-First Design**: Prioritizes responsiveness and optimal user experience on mobile devices.

## External Dependencies

### Frontend
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Validation**: Zod
- **Charts**: Chart.js and React-Chart.js-2

### Backend
- **Database Connection**: @neondatabase/serverless
- **ORM**: Drizzle ORM
- **Session Store**: connect-pg-simple
- **Validation**: Zod (shared)

### Development
- **Build Tools**: Vite (frontend), ESBuild (backend)
- **Type Checking**: TypeScript
- **Execution**: tsx