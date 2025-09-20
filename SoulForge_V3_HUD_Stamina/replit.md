# SOUL: Pyre of Determination

## Overview

SOUL is a brutal 3D action game built with React Three Fiber and Express.js. The game centers around a "genocide" mechanic where players must eliminate all enemies in each area to progress. It features a dark, artistic aesthetic with on-chain token integration for revival mechanics and community events. The game combines traditional 3D action gameplay with modern web3 tokenomics, creating a unique gaming experience where every death and revival comes at a cost.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **3D Engine**: React Three Fiber with Three.js for 3D rendering and physics
- **UI Framework**: React with TypeScript for component-based development
- **Styling**: TailwindCSS with custom design system using CSS variables
- **State Management**: Zustand for game state, combat mechanics, and audio management
- **Asset Pipeline**: Vite with GLSL shader support for advanced graphics

### Game State Architecture
- **Modular Store Pattern**: Separate Zustand stores for different game systems:
  - `useGame`: Core game phases (ready, playing, ended)
  - `useCombat`: Combat mechanics with Punch-Out style timing systems
  - `usePlayer`: Player position, health, and movement
  - `useEnemies`: Enemy management and AI
  - `useSouls`: Collectible currency and scoring
  - `useAudio`: Sound effects and music management

### 3D Game World
- **Scene Management**: Canvas-based 3D world with keyboard controls
- **Combat System**: Phase-based combat (overworld → entering → in_combat → exiting)
- **Enemy AI**: Basic pathfinding and attack patterns
- **Collision Detection**: Custom AABB collision system for player-enemy interactions

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Development Setup**: Vite integration for hot reloading in development
- **API Structure**: RESTful endpoints prefixed with `/api`
- **Storage Interface**: Modular storage system with in-memory implementation

### Database Layer
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Management**: Type-safe schema definitions with Zod validation
- **Migration System**: Drizzle-kit for database migrations
- **Development Storage**: In-memory storage for development with interface for easy swapping

### Asset Management
- **Texture Loading**: React Three Drei for efficient asset loading
- **Audio System**: HTML5 Audio with mute/unmute controls
- **3D Models**: Support for GLTF/GLB models and shader materials
- **Performance**: Optimized for web with configurable graphics settings

## External Dependencies

### Core Game Engine
- **React Three Fiber**: 3D rendering and scene management
- **React Three Drei**: Helper utilities for 3D development
- **React Three PostProcessing**: Visual effects pipeline
- **Three.js**: Underlying 3D graphics library

### Database & ORM
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL (configured but not currently connected)
- **Drizzle-kit**: Database migration and management tools

### UI & Styling
- **Radix UI**: Headless component library for accessible UI primitives
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Type-safe styling variants

### State & Data Management
- **Zustand**: Lightweight state management
- **TanStack React Query**: Server state management (configured but not actively used)
- **React Hook Form**: Form handling (components present)

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast bundling for production
- **GLSL Plugin**: Shader support for advanced graphics

### Blockchain Integration (Planned)
- **Solana Wallet Integration**: For SOUL token burns and transactions
- **On-chain Verification**: Burn address validation for revival mechanics
- **Community Events**: Global burn tracking for ritual mechanics