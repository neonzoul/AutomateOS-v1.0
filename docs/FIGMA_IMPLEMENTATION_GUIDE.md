# AutomateOS Figma Implementation Guide

> Complete specification for implementing the Figma mockup pixel-perfect UI

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--coral-primary: #E63946;        /* Main coral red */
--coral-gradient-start: #E84B4B;
--coral-gradient-end: #FF6B6B;

/* Background Colors */
--bg-dark: #1D1C1D;              /* Left sidebar & Inspector */
--bg-canvas: #F7FAFC;            /* Canvas light zen blue */
--bg-white: #FFFFFF;             /* Node cards */
--bg-gray-matte: #B0B0B0;        /* Controller bar */

/* Text Colors */
--text-primary: #1D3557;         /* Dark navy blue */
--text-secondary: #454545;       /* Medium gray */
--text-light: #FFFFFF;

/* Tag Colors */
--tag-purple: #7949FF;
--tag-blue: #494FFF;
--tag-red: #FF494C;
```

### Typography Scale

```css
/* Font Families */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;

/* Font Sizes */
--text-xs: 8px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 22px;
--text-xl: 28px;
--text-2xl: 34px;

/* Font Weights */
--font-normal: 400;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System (8pt Grid)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

### Shadow System

```css
/* Card Shadows */
--shadow-card: 0px 4px 12px rgba(0, 0, 0, 0.1);
--shadow-card-hover: 0px 8px 24px rgba(0, 0, 0, 0.15);

/* Panel Shadows */
--shadow-panel: 0px 0px 50px rgba(0, 0, 0, 0.15);

/* Button Shadows */
--shadow-button: 0px 2px 8px rgba(0, 0, 0, 0.08);
```

---

## 📐 Layout Structure

### Grid System
```
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation Bar (80px height)                            │
├──────────┬──────────────────────────────────────────────────┤
│ Apps Bar (64px height) - Full width                         │
├──────────┼──────────────────────────────────────┬───────────┤
│ Left     │                                      │ Right     │
│ Sidebar  │ Canvas (Infinite scroll)             │ Inspector │
│ (350px)  │                                      │ (variable)│
│          │                                      │           │
│ - Sample │                                      │ - Node    │
│   Tmpl   │                                      │   Config  │
│          │                                      │           │
│ - Agents │                                      │           │
│   Store  │                                      │           │
├──────────┴──────────────────────────────────────┴───────────┤
│ Bottom Controller Bar (~70px height, centered, rounded)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔝 Component Specifications

### 1. Top Navigation Bar

**Dimensions**:
- Height: `80px`
- Full width
- Fixed position

**Background**:
```css
background: #E63946;
```

**Layout**:
```
[DNA Logo + "AutomateOS"]  [spacer]  [Download Button] [Share Button]
```

**Left Section - DNA Logo**:
- SVG ribbon logo (81.2px × 24.93px)
- Text: "AutomateOS"
- Font: Helvetica 28.49px, color: #FEE7DB

**Right Section - Buttons**:

Download Button:
```css
width: 150px;
height: 52px;
border: 2px solid #FFFFFF;
border-radius: 12px;
background: transparent;
color: #FFFFFF;
font-size: 16px;
font-weight: 600;
```

Share Button:
```css
width: 150px;
height: 52px;
background: #FFFFFF;
border-radius: 12px;
color: #E63946;
font-size: 16px;
font-weight: 600;
```

---

### 2. App Node Toolbar

**Dimensions**:
- Height: `64px`
- Full width
- Fixed under nav bar

**Background**:
```css
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(255, 255, 255, 0.6);
```

**Content Layout**:
```
[App Icons: Google | Slack | LINE | Notion | Facebook | TikTok]
[Divider Line]
[Control Icons: AutomateOS | Workflow | AI]
```

**App Icon Specs**:
- Size: 56px × 56px circular
- Shadow: 0px 2px 8px rgba(0, 0, 0, 0.1)
- Spacing: 16px gap between icons
- Images: Real brand logos (not emoji)

**Divider**:
- Vertical line, 1px width, 40px height
- Color: rgba(0, 0, 0, 0.1)

---

### 3. Workflow Nodes

#### 3a. App Node (e.g., "Send to Slack")

**Dimensions**:
- Min width: 280px
- Padding: 16px
- Border-radius: 20px

**Layout**:
```
┌─────────────────────────────────────┐
│ [Icon] Send to Slack                │
│                                     │
│ Amet minim mollit non deserunt     │
│ ullamco est sit aliqua dolor do    │
│ amet sint. Velit officia...        │
│                                     │
│ [Tag] [Tag] [Tag]                  │
└─────────────────────────────────────┘
```

**Styling**:
```css
background: #FFFFFF;
border: 1px solid rgba(29, 53, 87, 0.1);
box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
```

**Icon**:
- Size: 40px × 40px
- Rounded: 10px
- Position: Top-left
- Dark background with app logo

**Title**:
- Font: Inter 16px, weight 600
- Color: #1D3557
- Margin-left from icon: 12px

**Description**:
- Font: Inter 8px, weight 400
- Color: #1D3557, opacity 0.6
- Line-height: 10px
- Margin-top: 8px

**Tags (bottom)**:
- 3 pills, 6px height
- Colors: #7949FF, #494FFF, #FF494C
- Border-radius: 1px
- Font: Inter 14px (for display), white text
- Gap: 0.75px

#### 3b. GPT Agent Node

**Dimensions**:
- Width: Auto
- Height: Auto
- Border-radius: 50px (pill shape)

**Layout**:
```
┌────────────────────────┐
│ [Icon] GPT Agent       │
└────────┬───────────────┘
         │
         ⊕ (connection button)
```

**Styling**:
```css
background: #FFFFFF;
border: 1px solid rgba(29, 53, 87, 0.1);
padding: 16px 24px;
```

**Icon**:
- Spiral/knot icon, 40px size
- Black color

**Connection Button** (`+`):
- Size: 24px × 24px
- Background: white
- Border: 1px solid rgba(0,0,0,0.1)
- Position: Below node, centered

---

### 4. Left Sidebar (Store Panel)

**Dimensions**:
- Width: `350px`
- Full height
- Fixed position

**Background**:
```css
background: #1D1C1D;
box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.15);
padding: 20px;
```

#### 4a. Sample Template Section

**Header**:
```css
font-family: Inter;
font-size: 28px;
font-weight: 600;
color: #FFFFFF;
margin-bottom: 20px;
```

#### 4b. Template Card

**Layout** (Horizontal):
```
┌─────────────────────────────────────────┐
│ AI Workflow Demo          [Preview]     │
│                                         │
│ Lorem ipsum dolor sit     [Image of    │
│ amet, consectetur...      workflow]    │
│                                         │
└─────────────────────────────────────────┘
```

**Styling**:
```css
background: #FFFFFF;
border-radius: 10px;
padding: 16px;
margin-bottom: 20px;
display: grid;
grid-template-columns: 1fr 1fr;
gap: 16px;
```

**Left Side (Text)**:
- Title: Inter 14px, weight 600, color #1D3557
- Description: Inter 8px, weight 400, color #1D3557 60% opacity

**Right Side (Preview)**:
- Background: #E63946
- Border-radius: 10px
- Contains mini workflow visualization

#### 4c. Divider

```css
width: 100%;
height: 1px;
background: rgba(255, 255, 255, 0.3);
margin: 30px 0;
```

#### 4d. Agents Store Section

**Header**:
- Same as Sample Template header

**Agent Cards Layout**:
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 10px;
```

**Agent Card** (Flow1, Flow2):

**Layout**:
```
┌──────────────┐
│ Flow1        │
│ ┌──────────┐ │
│ │ 🎤 Record│ │
│ │    │     │ │
│ │ 🔊 Trans │ │
│ │    │     │ │
│ │ ○ Summ   │ │
│ └──────────┘ │
└──────────────┘
```

**Styling**:
```css
background: #FFFFFF;
border-radius: 10px;
padding: 10px;
```

**Card Header**:
- Text: "Flow1" / "Flow2"
- Position: Top-left
- Font: Inter 14px, weight 600
- Color: #1D3557

**Workflow Preview**:
- Background: #E63946
- Border-radius: 10px
- Contains vertical node list with icons
- Nodes: White pills with icons and text
- Connectors: Vertical white lines (1px)

---

### 5. Right Inspector Panel

**Dimensions**:
- Width: Variable (but example shows ~280px)
- Full height

**Background**:
```css
background: #1D1C1D;
color: #FFFFFF;
padding: 20px;
```

#### 5a. Header

**Layout**:
```
[App Icon] Service Name
```

**App Icon**:
- Size: 48px × 48px
- Rounded: 8px
- Margin-right: 12px

**Service Name**:
- Font: Inter 28px, weight 600
- Color: #FFFFFF

#### 5b. Form Fields

**Field Label**:
```css
font-family: Inter;
font-size: 14px;
font-weight: 600;
color: #FFFFFF;
margin-bottom: 8px;
text-transform: uppercase;
```

**Input/Textarea**:
```css
background: transparent;
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: 8px;
padding: 12px 16px;
color: #FFFFFF;
font-family: Inter;
font-size: 14px;
width: 100%;
margin-bottom: 16px;
```

**Dropdown**:
```css
/* Same as input, plus: */
appearance: none;
background-image: url('expand-icon.svg');
background-repeat: no-repeat;
background-position: right 16px center;
padding-right: 40px;
```

---

### 6. Bottom Controller Bar

**Dimensions**:
- Width: Auto (centered, max 800px)
- Height: `70px`
- Border-radius: `35px` (pill shape)
- Position: Fixed bottom, centered

**Background**:
```css
background: linear-gradient(180deg, #B8B8B8 0%, #A0A0A0 100%);
padding: 12px 24px;
display: flex;
gap: 32px;
```

**Button Groups**:

Left Group (Playback):
- Play ▶
- Pause ‖
- Skip ⏭
- Loop 🔄

Right Group (Utilities):
- Import ⬇
- Undo ↶
- Redo ↷
- Add ➕

**Button Styling**:
```css
width: 40px;
height: 40px;
background: #333333;
border-radius: 8px;
color: #FFFFFF;
font-size: 18px;
display: flex;
align-items: center;
justify-content: center;
box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
cursor: pointer;
transition: all 0.2s ease;
```

**Button Hover**:
```css
background: #444444;
transform: translateY(-2px);
box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
```

**Divider Between Groups**:
```css
width: 1px;
height: 40px;
background: rgba(255, 255, 255, 0.2);
```

---

### 7. Panel Toggle Buttons

**Dimensions**:
- Width: `48px`
- Height: `80px`
- Border-radius: `24px 0 0 24px` (left) or `0 24px 24px 0` (right)

**Position**:
- Left toggle: `left: 0`, `top: 50%`, `transform: translateY(-50%)`
- Right toggle: `right: 0`, `top: 50%`, `transform: translateY(-50%)`

**Background**:
```css
background: linear-gradient(135deg, #E84B4B 0%, #FF6B6B 100%);
box-shadow: 0px 4px 12px rgba(232, 75, 75, 0.3);
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
```

**Icon**:
- Chevron `<` (left) or `>` (right)
- Color: white
- Font-size: 24px

**Hover State**:
```css
transform: scale(1.05);
box-shadow: 0px 6px 16px rgba(232, 75, 75, 0.4);
```

---

## 🎬 Animation Specs

### Page Transitions
```css
transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
```

### Panel Slide
```css
transform: translateX(-100%); /* hidden */
transform: translateX(0);     /* shown */
transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
```

### Button Hover
```css
transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Card Hover
```css
transform: translateY(-4px);
box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
transition: all 0.3s ease-out;
```

---

## 📦 Asset Requirements

### Logos Needed
1. **DNA Ribbon Logo** - `ribbon_logo.svg` (81.2 × 24.93px)
2. **Google** - 56px circular
3. **Slack** - 56px circular
4. **LINE** - 56px circular
5. **Notion** - 56px circular
6. **Facebook** - 56px circular
7. **TikTok** - 56px circular
8. **AutomateOS** - 56px circular (DNA pattern)
9. **Workflow** - 56px circular (flowchart icon)
10. **AI** - 56px circular (AI/robot icon)

### Icons Needed
11. Play `▶`
12. Pause `‖`
13. Skip `⏭`
14. Loop `🔄`
15. Import `⬇`
16. Undo `↶`
17. Redo `↷`
18. Add `➕`
19. Chevron Left `<`
20. Chevron Right `>`

---

## 🔧 Implementation Priority Order

1. ✅ Color palette constants
2. ✅ Typography system
3. ✅ Navigation bar redesign
4. ✅ App Node Toolbar with real logos
5. ✅ Workflow nodes redesign
6. ✅ Left sidebar template cards
7. ✅ Agent cards with workflow preview
8. ✅ Inspector panel dark theme
9. ✅ Controller bar gray matte
10. ✅ Panel toggle buttons
11. ✅ Final polish and animations

---

## 📱 Responsive Breakpoints

```css
/* Desktop: Default (3-panel layout) */
@media (min-width: 1025px) {
  --sidebar-width: 350px;
  --inspector-width: 280px;
}

/* iPad Portrait */
@media (max-width: 1024px) {
  /* Sidebars become toggleable overlays */
  --sidebar-width: 320px;
  --inspector-width: 100%;
}

/* Mobile */
@media (max-width: 768px) {
  /* Reduced sizes */
  --navbar-height: 64px;
  --toolbar-height: 56px;
}
```

---

## ✅ QA Checklist

- [ ] All colors match Figma exactly
- [ ] Typography sizes and weights correct
- [ ] Spacing follows 8pt grid
- [ ] Shadows match specifications
- [ ] Border-radius values correct
- [ ] All brand logos loaded
- [ ] Hover states working
- [ ] Animations smooth (60fps)
- [ ] Dark theme panels implemented
- [ ] Responsive behavior on iPad
- [ ] Panel toggles functional
- [ ] Controller bar centered and styled
- [ ] Node connection buttons working
- [ ] Tags display correctly on nodes
