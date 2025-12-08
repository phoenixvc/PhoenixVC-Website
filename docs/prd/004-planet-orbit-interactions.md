# PRD-004: Planet Orbit Interactions with Mouse Clicks

## Status
**Draft**

## Metadata
- **Created:** 2025-12-08
- **Last Updated:** 2025-12-08
- **Owner:** Phoenix VC Development Team
- **Stakeholders:** Product Team, UX Design, Development Team
- **Target Release:** Q2 2025

---

## 1. Overview

### Summary
Enhance user interaction with the starfield visualization by allowing users to click and drag to create orbital paths, nudge celestial bodies, and dynamically influence their trajectories, creating an engaging interactive experience.

### Goals
- Enable direct manipulation of celestial bodies via mouse interactions
- Allow users to "draw" orbital paths for planets
- Create intuitive controls for influencing gravitational dynamics
- Make the physics simulation feel responsive to user input

### Non-Goals
- Precise astronomical calculations for real orbits
- Multi-touch gestures (desktop-first)
- Undo/redo functionality for orbital changes
- Saving/sharing custom orbital configurations

---

## 2. Motivation

### Business Value
Interactive elements increase user engagement and dwell time, key metrics for website performance. Allowing users to "play" with the cosmos creates memorable experiences that reinforce Phoenix VC's brand as innovative and user-centric.

### User Need
Users want to feel agency and control in digital experiences:
- Ability to experiment and explore
- Direct feedback from their actions
- Playful, creative interaction opportunities
- Sense of ownership over the visualization

### Current Pain Points
- Users are passive observers of the starfield
- No way to interact with celestial bodies beyond hovering
- Limited engagement opportunities
- Visualization feels predetermined and fixed
- No creative expression or experimentation possible

---

## 3. User Stories

### Primary User Stories
1. **As a** website visitor,
   **I want** to click and drag to create an orbital path,
   **So that** I can place planets in custom orbits

2. **As a** user,
   **I want** to click on a planet to nudge it in a direction,
   **So that** I can influence its trajectory

3. **As a** user exploring the starfield,
   **I want** to see visual feedback when I hover over draggable objects,
   **So that** I know what I can interact with

4. **As a** user,
   **I want** orbital paths to respect physics (PRD-002),
   **So that** the interactions feel realistic

5. **As a** mobile user,
   **I want** touch-based interactions for orbital control,
   **So that** I can enjoy the feature on any device

### Edge Cases
- User drags planet into collision course with sun
- Multiple rapid clicks on the same planet
- Dragging outside canvas boundaries
- Creating impossible orbital paths (too fast/slow)
- Interaction during active animations or transitions

---

## 4. Functional Requirements

### Must Have (P0)
- [ ] Click detection on planets/celestial bodies
- [ ] Drag interaction to move planets
- [ ] Visual indicator for draggable objects (cursor change, glow)
- [ ] Velocity imparted based on drag speed and direction
- [ ] Collision detection prevents invalid placements
- [ ] Hover states for interactive objects
- [ ] Mouse cursor changes for interactive states

### Should Have (P1)
- [ ] Orbital path preview while dragging (dotted line showing future trajectory)
- [ ] "Nudge" mode: click to give small impulse
- [ ] "Place" mode: click and drag to set position and initial velocity
- [ ] Visual feedback showing force/velocity being applied
- [ ] Undo last interaction (single level)
- [ ] Reset button to restore original state
- [ ] Tutorial/help overlay explaining interactions

### Nice to Have (P2)
- [ ] Multi-touch gestures for tablets
- [ ] Right-click context menu with options (delete, freeze, etc.)
- [ ] Planet creation mode (click to spawn new planet)
- [ ] Orbit stability indicators (green = stable, red = collision course)
- [ ] Sound effects for interactions
- [ ] Haptic feedback on supported devices
- [ ] Saved interaction presets ("interesting patterns")

---

## 5. Non-Functional Requirements

### Performance
- Mouse interaction latency <16ms (1 frame at 60fps)
- Drag operations maintain 60 FPS
- Path preview calculations <5ms
- Click detection using quadtree for efficiency

### Security
- Input validation for all mouse coordinates
- Prevent excessive force values
- Rate limiting for rapid interactions

### Accessibility
- Keyboard alternative for all mouse interactions
- Screen reader announcements for interaction states
- High contrast mode for visual indicators
- Reduced motion support for animations

### Browser Support
- Modern browsers with pointer events support
- Touch events fallback for older mobile browsers
- Graceful degradation if WebGL effects not supported

---

## 6. Technical Considerations

### Architecture

```
┌─────────────────────────────────────────────┐
│           Interaction Layer                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Mouse   │  │  Touch   │  │ Keyboard │  │
│  │  Events  │  │  Events  │  │  Events  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │              │         │
│       └─────────────┼──────────────┘         │
│                     ▼                        │
│           ┌──────────────────┐               │
│           │  Interaction     │               │
│           │  Controller      │               │
│           └────────┬─────────┘               │
│                    │                         │
│                    ▼                         │
│           ┌──────────────────┐               │
│           │  Physics Engine  │               │
│           │  (Apply Forces)  │               │
│           └──────────────────┘               │
└─────────────────────────────────────────────┘
```

### Interaction Modes

#### Mode 1: Nudge (Simple Click)
```typescript
// Apply impulse based on click position relative to planet
const direction = normalize(clickPos - planetPos);
const impulse = NUDGE_STRENGTH * direction;
planet.velocity += impulse;
```

#### Mode 2: Drag (Click and Drag)
```typescript
// Set velocity based on drag vector
const dragVector = dragEnd - dragStart;
planet.velocity = dragVector * DRAG_VELOCITY_SCALE;
```

#### Mode 3: Orbital Path Drawing
```typescript
// Preview orbital path using physics simulation
const previewSteps = 100;
const trajectory = [];
let pos = planet.position.clone();
let vel = planet.velocity.clone();

for (let i = 0; i < previewSteps; i++) {
  trajectory.push(pos.clone());
  // Simulate physics for preview
  const force = calculateGravity(pos, nearbyBodies);
  vel += force * previewDeltaTime;
  pos += vel * previewDeltaTime;
}
```

### Key Components
- **InteractionController:** Manages all user interactions with the canvas
- **DragHandler:** Handles drag-and-drop logic for planets
- **OrbitPreview:** Calculates and renders predicted orbital paths
- **HitDetection:** Efficiently detects which object user is interacting with
- **InteractionFeedback:** Visual and audio feedback for interactions

### Technology Stack
- Pointer Events API (unified mouse/touch handling)
- Canvas API for visual feedback
- Custom hit detection using quadtree (ADR-002)
- Existing physics engine (PRD-002)

### Integration Points
- Physics engine (PRD-002) - applies user-generated forces
- Quadtree (ADR-002) - efficient hit detection
- Celestial body renderer - highlights interactive objects
- Game mode (PRD-001) - interaction modes may differ in game mode
- Camera system - mouse coordinates need viewport transformation

---

## 7. Dependencies

### Internal Dependencies
- ADR-002: Quadtree for efficient hit detection
- PRD-002: Physics engine to apply forces
- Celestial body data structures
- Camera/viewport transformation system

### External Dependencies
- None (uses native browser APIs)

### Prerequisites
- Physics engine implemented (PRD-002)
- Stable orbital mechanics
- Canvas interaction foundation

---

## 8. Success Metrics

### Key Performance Indicators (KPIs)
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Interaction engagement rate | N/A | 40% of users | Event tracking |
| Avg. interactions per session | N/A | 5+ | Analytics |
| Interaction latency | N/A | <20ms | Performance monitoring |
| User session duration | ~2 min | +50% | Analytics |
| Feature discovery rate | N/A | 60% | User testing |

### User Acceptance Criteria
- [ ] Users can successfully drag and place planets
- [ ] Visual feedback is clear and immediate
- [ ] Interactions feel responsive and natural
- [ ] Physics behaves predictably after interactions
- [ ] Tutorial effectively explains features
- [ ] Works on both desktop and touch devices

---

## 9. Timeline

### Phase 1: Basic Interactions (2 weeks)
**Duration:** 2 weeks
- [ ] Implement click detection on planets
- [ ] Add drag-and-drop functionality
- [ ] Create hover states and visual feedback
- [ ] Integrate with physics engine

### Phase 2: Orbital Preview (2 weeks)
**Duration:** 2 weeks
- [ ] Implement trajectory prediction algorithm
- [ ] Render orbital path preview
- [ ] Optimize preview calculations for performance
- [ ] Add visual polish and effects

### Phase 3: Enhanced Interactions (2 weeks)
**Duration:** 2 weeks
- [ ] Add nudge mode
- [ ] Implement touch gesture support
- [ ] Create tutorial overlay
- [ ] Add reset functionality

### Phase 4: Testing & Polish (1 week)
**Duration:** 1 week
- [ ] User testing and feedback
- [ ] Performance optimization
- [ ] Bug fixes and edge cases
- [ ] Documentation

---

## 10. Open Questions

### Technical Questions
- [ ] **Q:** How many preview steps for orbital path without performance impact?
  - **Status:** Open
  - **Notes:** Need to balance accuracy vs performance

- [ ] **Q:** Should we limit the maximum force user can apply?
  - **Status:** Open
  - **Notes:** Prevent unrealistic velocities

- [ ] **Q:** How to handle multi-body gravitational influence in preview?
  - **Status:** Under Discussion
  - **Notes:** May need simplified calculation for preview

### Product Questions
- [ ] **Q:** Should interactions be permanent or temporary?
  - **Status:** Open
  - **Notes:** Permanent changes may be frustrating without undo

- [ ] **Q:** What happens if user creates unstable system?
  - **Status:** Under Discussion
  - **Notes:** Could show warning or auto-stabilize

- [ ] **Q:** Should we guide users toward stable orbits?
  - **Status:** Open
  - **Notes:** Balance between freedom and frustration

---

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Poor discoverability | High | Medium | Clear visual cues, tutorial, user testing |
| Performance issues with preview | High | Medium | Optimize calculations, limit preview length, use worker |
| Confusing physics behavior | Medium | High | Clear visual feedback, tooltips, tutorial |
| Touch interaction issues | Medium | Medium | Extensive mobile testing, larger touch targets |
| Users creating chaotic systems | Low | High | Reset button, auto-stabilization option |

---

## 12. Alternatives Considered

### Alternative 1: Pre-defined Orbit Slots
**Description:** Users select from preset orbital slots
**Pros:** Simple, always stable, no complex interactions
**Cons:** Less engaging, limited creativity
**Decision:** Rejected - too restrictive

### Alternative 2: Orbit Editor UI Panel
**Description:** Separate UI with sliders for orbital parameters
**Pros:** Precise control, clear interface
**Cons:** Less intuitive, breaks immersion
**Decision:** Could be advanced option

### Alternative 3: Physics Sandbox Mode
**Description:** Separate mode where all physics are user-controlled
**Pros:** Maximum freedom, clear expectations
**Cons:** Separates feature from main experience
**Decision:** Could be future enhancement

---

## 13. References

- Pointer Events API: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- [ADR-002: Quadtree Spatial Partitioning](../adr/002-spatial-partitioning-quadtree.md)
- [PRD-002: Physics & Math Calculations](./002-physics-math-calculations.md)
- [PRD-001: Game Mode with Spaceships](./001-game-mode-spaceships.md)
- Universe Sandbox (inspiration): https://universesandbox.com/
- Interactive Physics Simulations: https://phet.colorado.edu/

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-08 | 0.1 | AI Agent | Initial draft based on feature requirements |
