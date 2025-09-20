# SOUL: Pyre of Determination

## Overview

SOUL: Pyre of Determination is a brutal 3D action game built with React Three Fiber, Express.js, and PostgreSQL. The game centers around a psychological "genocide" mechanic where players must eliminate all enemies in each area to progress. It features sophisticated combat systems, dynamic environmental decay, musical corruption that responds to player actions, and a burn-to-revive mechanism using on-chain tokens. The project implements a modular architecture with separate client and server structures, advanced 3D rendering with Three.js, and real-time state management across multiple game systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **3D Engine**: React Three Fiber with Three.js for 3D rendering, physics, and shader support
- **UI Framework**: React with TypeScript for component-based development
- **Styling**: TailwindCSS with Radix UI components and custom CSS variables design system
- **State Management**: Zustand for modular game state management across different systems
- **Asset Pipeline**: Vite with GLSL shader support, custom texture loading, and 3D model support
- **Canvas Rendering**: Dual-layer approach with 3D Canvas and 2D HUD overlay system

### Game State Architecture
The game uses a modular Zustand store pattern with specialized stores for different game systems:
- **Core Game Flow**: `useGame` for game phases (ready, playing, ended)
- **Combat System**: `useCombat` for Punch-Out style timing-based combat mechanics
- **Player Management**: `usePlayer` for position, health, movement, and stats
- **Enemy System**: `useEnemies` for enemy AI, spawning, and management
- **Currency Systems**: `useSouls` for collectible currency and `useGenocide` for kill tracking
- **Audio Management**: `useAudio` and `useMusicCorruption` for dynamic audio and corruption
- **Telegraph Combat**: `useTelegraph` for wind-up bars, evade arrows, and timing mechanics
- **Visual Effects**: `useDamageNumbers` for floating combat feedback

### Combat and Telegraph System
- **Phase-Based Combat**: Overworld → entering → in_combat → exiting transitions
- **Telegraph UI Components**: Wind-up bars, directional evade arrows, defend rings
- **Timing Windows**: Frame-perfect dodge and block mechanics with visual feedback
- **Damage Resolution**: Centralized damage calculation with armor, criticals, and corruption scaling
- **Success Feedback**: Toast notifications, camera shake, and audio cues for perfect timing

### 3D World and Environment
- **Scene Management**: Canvas-based 3D world with keyboard controls and camera management
- **Dynamic Environments**: Area-based themes (Hollow Vale, Shattered Crypt, Abyss Below)
- **Environmental Decay**: Visual progression from clean → corrupted based on kill count
- **Collision Detection**: Custom AABB collision system for player-enemy interactions
- **Texture Management**: Multi-texture ground materials that change with genocide progress

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for RESTful API endpoints
- **Development Setup**: Vite integration with hot module reloading and error overlay
- **API Structure**: Prefixed `/api` routes with middleware for logging and error handling
- **Modular Storage**: Interface-based storage system with swappable implementations

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema Management**: Shared schema definitions between client and server with Zod validation
- **Migration System**: Drizzle-kit for database schema migrations and updates
- **Connection**: Neon Database serverless PostgreSQL for production deployment
- **Development Storage**: In-memory storage implementation for development and testing

### Audio and Music System
- **Dynamic Music Corruption**: Multi-layer audio system that responds to player actions
- **Instrument Progression**: Piano detuning, string vibrato, percussion tempo changes
- **Area-Specific Soundscapes**: Different musical themes for each game area
- **Corruption Scaling**: Static intensity and whisper vocals that increase with burn count
- **Boss Phase Audio**: Special audio cues and transitions for boss encounters

### Asset and Performance Management
- **Texture Loading**: React Three Drei for efficient 3D asset loading and caching
- **Audio System**: HTML5 Audio with dynamic volume control and mute functionality
- **3D Models**: Support for GLTF/GLB models with material and shader customization
- **HUD Rendering**: Fixed-resolution canvas overlay with integer scaling for pixel-perfect UI
- **Memory Management**: Proper cleanup and disposal of 3D resources and audio objects

## External Dependencies

### 3D Graphics and Rendering
- **Three.js**: Core 3D engine for rendering, materials, and scene management
- **React Three Fiber**: React integration for Three.js with declarative 3D components
- **React Three Drei**: Helper components for cameras, controls, and asset loading
- **React Three Postprocessing**: Advanced rendering effects and post-processing pipeline

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI elements
- **TailwindCSS**: Utility-first CSS framework with custom design system integration
- **Class Variance Authority**: Type-safe component variants and styling patterns
- **Clsx**: Conditional CSS class composition utility

### State Management and Data
- **Zustand**: Lightweight state management for modular game systems
- **TanStack React Query**: Server state management and data fetching
- **Zod**: Runtime type validation and schema definitions

### Database and Backend
- **Drizzle ORM**: Type-safe PostgreSQL ORM with schema migrations
- **Neon Database**: Serverless PostgreSQL database hosting
- **Express.js**: Web server framework for API endpoints and middleware
- **Connect-pg-simple**: PostgreSQL session store for Express sessions

### Development and Build Tools
- **Vite**: Fast build tool with hot module reloading and plugin ecosystem
- **TypeScript**: Type safety across client, server, and shared code
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with TailwindCSS and Autoprefixer plugins

### Font and Asset Management
- **Fontsource**: Self-hosted web fonts with Inter typography
- **GLSL Support**: Shader loading and compilation for advanced graphics effects
- **Asset Pipeline**: Support for textures, 3D models, and audio files through Vite