# Replit.md - Material Inventory Management System

## Overview

This is a full-stack material inventory management system built with React (frontend) and Express.js (backend). The application allows users to manage materials, track inventory levels, and monitor stock status with a modern, mobile-friendly interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Theme**: Light/dark mode support with custom theme provider

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Validation**: Zod schemas shared between frontend and backend
- **Session Management**: Express sessions with PostgreSQL store

### Development Setup
- **Monorepo Structure**: Shared code between client and server
- **Development Server**: Vite dev server with HMR
- **Type Safety**: Full TypeScript coverage across the stack
- **Code Organization**: Modular architecture with clear separation of concerns

## Key Components

### Database Schema
- **Materials Table**: Core entity with fields for name, description, category, quantity, unit, SKU, and stock levels
- **Enhanced Fields**: Added dateOfPurchase, supplierName, totalYards (for fabrics), and usageForProduct
- **Schema Definition**: Located in `shared/schema.ts` using Drizzle ORM
- **Validation**: Zod schemas for insert and update operations
- **Categories**: Predefined categories for material classification with special handling for fabrics

### API Endpoints
- `GET /api/materials` - Retrieve all materials
- `GET /api/materials/:id` - Get specific material by ID
- `POST /api/materials` - Create new material
- `PUT /api/materials/:id` - Update existing material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/stats` - Get inventory statistics
- `GET /api/consumption` - Get material consumption data for analytics
- `POST /api/consumption` - Record material consumption for COGS tracking
- `GET /api/products` - Get all products
- `GET /api/product-skus` - Get all product SKUs

### Frontend Components
- **Material Card**: Individual material display with actions
- **Add Material Modal**: Form for creating/editing materials
- **Material Consumption Modal**: COGS tracking with product/SKU selection
- **Search Filter**: Material search and category filtering
- **Stats Cards**: Dashboard statistics display
- **Analytics Dashboard**: Comprehensive analytics with 4 tabs (Overview, Alerts, Projections, Trends)
- **Bottom Navigation**: Mobile-friendly navigation with Analytics tab

### Storage Layer
- **Interface**: `IStorage` interface for data operations
- **Implementation**: DatabaseStorage with PostgreSQL integration (replaced MemStorage)
- **Database Integration**: Drizzle ORM with Neon PostgreSQL serverless database
- **Sample Data**: Seeded database with materials, products, and SKUs for immediate testing

## Data Flow

1. **User Interaction**: User interacts with React components
2. **Form Validation**: Client-side validation with React Hook Form + Zod
3. **API Calls**: TanStack Query manages API requests to Express backend
4. **Server Processing**: Express routes handle requests and validate data
5. **Database Operations**: Drizzle ORM executes database queries
6. **Response**: Data flows back through the same path to update UI

### State Management
- **Server State**: TanStack Query for caching and synchronization
- **Form State**: React Hook Form for form management
- **UI State**: React hooks for component-level state
- **Theme State**: Context API for theme management

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting
- **Validation**: Zod for schema validation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Validation**: Shared Zod schemas for data validation

### Development Dependencies
- **Build Tools**: Vite for frontend building, ESBuild for backend
- **Type Checking**: TypeScript for full type safety
- **Development**: tsx for TypeScript execution in development

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations for schema management

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Development**: Local development with Vite dev server
- **Production**: Bundled Express server serving static files

### File Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── hooks/
├── server/          # Express backend
│   ├── index.ts
│   ├── routes.ts
│   └── storage.ts
├── shared/          # Shared types and schemas
│   └── schema.ts
└── migrations/      # Database migrations
```

### Key Architectural Decisions

1. **Monorepo with Shared Types**: Ensures type safety between frontend and backend
2. **Drizzle ORM**: Provides type-safe database operations with PostgreSQL
3. **TanStack Query**: Manages server state with caching and synchronization
4. **Radix UI + Tailwind**: Combines accessibility with modern styling
5. **Zod Validation**: Shared validation schemas reduce code duplication
6. **Mobile-First Design**: Responsive interface optimized for mobile devices

This architecture provides a scalable, type-safe foundation for a material inventory management system with modern development practices and user experience.