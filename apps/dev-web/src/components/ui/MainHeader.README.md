# AutomateOS Main Header - Design Specifications

## Overview
The MainHeader component implements an Apple-level navigation bar that matches the reference design with a clean coral background, white text, and sophisticated action buttons.

## Key Design Elements

### 1. Color Palette
- **Primary Background**: Linear gradient from `#FF6B6B` to `#E84B4B`
- **Text Color**: `rgba(255, 255, 255, 0.98)` - Near white with subtle transparency
- **Button Background**: `rgba(255, 255, 255, 0.15)` with glass morphism effect
- **Border Accents**: `rgba(255, 255, 255, 0.18)` for subtle definition

### 2. Layout Specifications
- **Height**: 56px (Apple standard navbar height)
- **Padding**: 24px horizontal (16px on mobile)
- **Position**: Fixed top with z-index 9999
- **Max Width**: 1440px centered container for large screens

### 3. Typography System
- **Brand Text**: SF Pro Display, 18px, 700 weight, -0.02em letter spacing
- **Button Text**: SF Pro Text, 14px, 600 weight, -0.01em letter spacing
- **Infinity Symbol**: 22px with floating animation (6s ease-in-out)

### 4. Button Design
- **Shape**: Pill-shaped with 18px border radius
- **Padding**: 8px vertical, 20px horizontal
- **Min Width**: 80px for consistent sizing
- **Glass Effect**: 20px backdrop blur with 15% white background
- **Shadow Layers**: Multiple box shadows for depth and inner light

### 5. Interaction States
- **Hover**: Scale up by 2%, translate up 1px, enhanced shadow
- **Active**: Return to baseline, reduced background opacity
- **Disabled**: 50% opacity, no hover effects, muted appearance
- **Running State**: Animated spinner icon with text change

### 6. Animation Curves
- **Primary**: `cubic-bezier(0.25, 0.8, 0.25, 1)` - Smooth Apple-style easing
- **Spring**: `cubic-bezier(0.23, 1, 0.32, 1)` - Natural spring motion
- **Micro**: `cubic-bezier(0.34, 1.56, 0.64, 1)` - Bouncy micro-interactions

### 7. Shadow System
```css
/* Default State */
0 1px 3px rgba(232, 75, 75, 0.12),
0 1px 2px rgba(232, 75, 75, 0.24),
inset 0 1px 0 rgba(255, 255, 255, 0.1)

/* Scrolled State */
0 2px 4px -1px rgba(232, 75, 75, 0.06),
0 4px 6px -1px rgba(232, 75, 75, 0.10),
0 1px 0 rgba(232, 75, 75, 0.05),
inset 0 1px 0 rgba(255, 255, 255, 0.1)
```

### 8. Glass Morphism Effect
- **Backdrop Filter**: `saturate(180%) blur(20px)`
- **WebKit Support**: Prefixed for Safari compatibility
- **Translucent Layers**: Multiple rgba backgrounds for depth

## Implementation Notes

### Component Structure
```tsx
<MainHeader
  onRun={() => handleRun()}      // Triggered when Run button clicked
  onShare={() => handleShare()}   // Triggered when Share button clicked
  isRunning={boolean}            // Shows running state with spinner
/>
```

### Page Integration
The header requires a 56px top margin on the main content to prevent overlap:
```css
margin-top: 56px;
height: calc(100vh - 56px);
```

### Responsive Behavior
- **Desktop**: Full 24px padding, 80px min button width
- **Mobile (<768px)**: 16px padding, 70px min button width, smaller font sizes
- **Animation**: Respects `prefers-reduced-motion` for accessibility

### Accessibility Features
- **Focus Indicators**: 2px white outline with 2px offset
- **ARIA Labels**: Semantic button labeling
- **Keyboard Navigation**: Full keyboard support
- **High Contrast Mode**: Enhanced borders and font weights

## Design Philosophy
This header embodies Apple's design principles:
- **Clarity**: Every element has a clear purpose
- **Deference**: The interface doesn't compete with content
- **Depth**: Subtle shadows and translucency create spatial hierarchy
- **Simplicity**: Complex functionality hidden behind simple interactions

## Usage Example
```tsx
import { MainHeader } from '@/components/ui/MainHeader';

export default function BuilderPage() {
  const handleRun = async () => {
    // Run workflow logic
  };

  const handleShare = () => {
    // Share workflow logic
  };

  return (
    <>
      <MainHeader
        onRun={handleRun}
        onShare={handleShare}
        isRunning={isWorkflowRunning}
      />
      <main style={{ marginTop: '56px' }}>
        {/* Page content */}
      </main>
    </>
  );
}
```

## Future Enhancements
- Add user avatar/profile section
- Include workspace switcher
- Add notification bell with badge
- Implement command palette trigger (⌘K)
- Add breadcrumb navigation for deep pages