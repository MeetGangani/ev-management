# EV Management System - Frontend

This is the frontend for the EV Management System, a modern web application for managing electric vehicle rentals.

## Features

- User authentication (login/register)
- Role-based access (Admin, Station Master, Customer)
- View and book EVs by location
- View and manage bookings
- Modern UI with animations and interactive elements
- Responsive design for mobile and desktop

## UI Features Implementation

The UI has been enhanced with modern design elements and features as part of a comprehensive UI modernization plan:

### Phase 1: Design System Modernization
- Enhanced Tailwind configuration with custom colors and extended features
- Card glass morphism effects with backdrop blur
- Text gradient effects
- Modern button styles with hover animations

### Phase 2: Component Enhancements
- Header component with animation and glassmorphism
- Card components with hover effects
- Form components with modern styling
- Login and registration forms with enhanced UI

### Phase 3: Layout Improvements
- Improved spacing and visual hierarchy
- Mobile-responsive layouts
- Animated transitions between sections
- Enhanced user flow

### Phase 4: Motion & Animation
- **Page Transitions**: Smooth transitions between routes using `PageTransition` component
- **Animated Icons**: Custom animated icons using `AnimatedIcons` component with Framer Motion
- **Scroll-triggered Animations**: Elements animate into view as user scrolls using `ScrollReveal` component
- **Interactive Elements**: Buttons, cards, and inputs with micro-interactions

### Phase 5: Advanced UI Features
- **Dark Mode Support**: Theme switching with `ThemeSwitcher` component
- **Skeleton Loading State**: Loading placeholders with subtle animations using `SkeletonLoaders` component
- **Advanced Notification System**: Toast notifications with different severity levels using `NotificationSystem`
- **Animated Charts & Data Visualization**: Interactive data visualization using `AnimatedCharts` component

## Reusable Components

### Animation Components
- **PageTransition**: Provides smooth transitions between pages
- **ScrollReveal**: Animates elements as they enter the viewport
- **AnimatedIcons**: Provides animated versions of common icons
- **AnimatedCharts**: Bar, line, and pie charts with animations

### UI Components
- **ThemeSwitcher**: Toggle between light and dark themes
- **SkeletonLoaders**: Placeholder loading states
- **NotificationSystem**: Toast notifications with different severity levels
- **StationMasterStatsCard**: Dashboard statistics with charts

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Lint the code
- `npm run preview`: Preview production build

## Dependencies

- React 18
- Redux Toolkit
- React Router
- Framer Motion
- Chart.js
- Tailwind CSS
- React Icons 