# Sprint 1 Demo Instructions

## 🎬 Demo Recording Guidelines

To record a proper Sprint 1 handover demo, follow these steps:

### Pre-Recording Setup
1. Close unnecessary browser tabs and applications
2. Start the dev server: `pnpm -C apps/dev-web dev`
3. Open http://localhost:3000 in a clean browser window
4. Have a screen recorder ready (Loom, OBS, or built-in)

### Demo Flow (2-3 minutes)

#### 1. Landing Page (15 seconds)
- Show http://localhost:3000/ 
- Briefly mention "Sprint 1 deliverable for AutomateOS"
- Navigate to `/builder`

#### 2. Canvas Interaction (60 seconds)
- Show empty canvas
- **Add Start Node**: Click toolbar → Start Node appears
- **Add HTTP Node**: Click toolbar → HTTP Node appears
- **Drag nodes around**: Demonstrate pan/zoom functionality
- **Connect nodes**: Drag from Start node handle to HTTP node

#### 3. Inspector Panel (30 seconds)
- Click on the **Start Node** → Inspector updates on right
- Click on the **HTTP Node** → Inspector shows different content
- Click on empty canvas → Inspector clears

#### 4. RunPanel (15 seconds)
- Point to the "Run" panel at bottom
- Mention: "Run panel is stubbed for Sprint 2 - engine integration"

#### 5. Persistence Demo (20 seconds)
- Refresh the page
- Show that nodes and connections persist (localStorage)
- Mention: "Automatic save to localStorage"

### Recording Tips
- **Narrate briefly**: "This is the Sprint 1 deliverable showing the workflow builder scaffold"
- **Keep it clean**: No IDE, terminal, or code visible
- **Smooth movements**: Don't rush the mouse movements
- **Show functionality**: Focus on what works, acknowledge what's stubbed

### File Outputs
- **Loom Link**: For PR description
- **GIF Export**: Save as `docs/Demos/sprint1-demo.gif` (optional)

---

## ✅ Demo Checklist

- [ ] Canvas loads and is interactive
- [ ] Toolbar adds Start and HTTP nodes
- [ ] Nodes can be dragged and connected
- [ ] Inspector updates based on selection
- [ ] RunPanel is visible (stubbed)
- [ ] localStorage persistence works
- [ ] Recording is clean and narrated
- [ ] Loom link is ready for PR

---

*This demo validates Sprint 1 scope: Canvas scaffold, node registry, basic interactions, and persistence.*
