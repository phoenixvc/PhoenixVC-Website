# PRD-001: Game Mode with Spaceships

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
Implement an interactive game mode that allows users to control a spaceship and navigate through the cosmic starfield visualization, transforming the website experience from passive viewing to active exploration.

### Goals
- Create an engaging, interactive experience that showcases Phoenix VC's innovation
- Increase user engagement time on the website
- Differentiate Phoenix VC's digital presence from competitors
- Provide an entertaining way to explore the portfolio and cosmic theme

### Non-Goals
- Full-featured game with scoring or leaderboards
- Multi-player functionality
- Mobile-first experience (desktop recommended)
- Game monetization or in-game purchases

---

## 2. Motivation

### Business Value
An interactive game mode creates a memorable brand experience that aligns with Phoenix VC's vision of innovation and technology. It serves as a conversation starter with potential partners and demonstrates the firm's commitment to cutting-edge digital experiences.

### User Need
Users visiting venture capital websites often have limited engagement options beyond reading content. An interactive game mode provides:
- Entertainment value during site exploration
- A unique way to discover portfolio companies
- Memorable brand interaction that increases recall

### Current Pain Points
- Static website experiences lack engagement
- Portfolio exploration is purely informational
- Limited differentiation from competitor websites
- No interactive elements to showcase technical capabilities

---

## 3. User Stories

### Primary User Stories
1. **As a** website visitor,
   **I want** to toggle game mode on/off,
   **So that** I can choose between traditional browsing and interactive exploration

2. **As a** user in game mode,
   **I want** to control a spaceship using keyboard controls,
   **So that** I can navigate through the starfield

3. **As a** user flying a spaceship,
   **I want** to interact with planets/suns (portfolio companies),
   **So that** I can discover information about investments in an engaging way

4. **As a** mobile user,
   **I want** to be informed that game mode is best experienced on desktop,
   **So that** I understand the optimal experience requirements

### Edge Cases
- User enables game mode during page transitions
- User switches tabs while in game mode
- Spaceship collision with screen boundaries
- Multiple rapid toggles of game mode

---

## 4. Functional Requirements

### Must Have (P0)
- [ ] Game mode toggle button in the UI (easily accessible)
- [ ] Spaceship rendering with distinct visual design
- [ ] Keyboard controls (arrow keys or WASD) for spaceship movement
- [ ] Collision detection with portfolio planets/suns
- [ ] Smooth camera follow for spaceship (viewport tracking)
- [ ] Disclaimer when enabling game mode (experimental feature notice)
- [ ] Ability to exit game mode at any time
- [ ] Spaceship physics (momentum, acceleration, deceleration)

### Should Have (P1)
- [ ] Spaceship rotation animation based on movement direction
- [ ] Particle effects for spaceship thrust/engine
- [ ] Sound effects toggle (optional audio for engine, collisions)
- [ ] Visual indicator showing game mode is active
- [ ] Minimap showing spaceship position in the cosmos
- [ ] Tutorial/help overlay on first game mode activation

### Nice to Have (P2)
- [ ] Multiple spaceship designs to choose from
- [ ] Warp speed boost mechanic (hold shift key)
- [ ] Achievement tracking (planets visited, distance traveled)
- [ ] Gamepad/controller support
- [ ] Screen shake effects on collisions
- [ ] Trail effect behind spaceship

---

## 5. Non-Functional Requirements

### Performance
- Maintain 60 FPS during spaceship movement and interactions
- Game mode activation should complete within 500ms
- Spaceship control response time < 16ms (1 frame at 60fps)
- Canvas rendering optimization to handle spaceship layer

### Security
- No external game assets loaded from untrusted sources
- Local storage limits for user preferences
- Input sanitization for keyboard controls

### Accessibility
- Game mode is optional, not required for site navigation
- Alternative text for game mode toggle button
- Keyboard shortcuts announced to screen readers
- High contrast option for spaceship visibility

### Browser Support
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- WebGL support required
- Fallback message for unsupported browsers
- Desktop experience recommended (>1024px viewport)

---

## 6. Technical Considerations

### Architecture
The game mode will be implemented as a layer on top of the existing starfield canvas system, using the consolidated RAF loop from ADR-001.

```
┌─────────────────────────────────────────────┐
│         Single RAF Loop (ADR-001)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Camera  │→ │  Physics │→ │ Renderer │  │
│  │  Update  │  │  Update  │  │   Pass   │  │
│  │          │  │          │  │          │  │
│  │          │  │ + Ship   │  │ + Ship   │  │
│  │          │  │   Physics│  │   Layer  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

### Key Components
- **SpaceshipController:** Handles input and spaceship state management
- **SpaceshipPhysics:** Implements movement, acceleration, and collision physics
- **SpaceshipRenderer:** Renders spaceship sprite/model on canvas
- **GameModeToggle:** UI component for enabling/disabling game mode
- **GameModeContext:** React context for game mode state management

### Technology Stack
- React for UI components
- TypeScript for type safety
- Canvas API for rendering
- Existing animation framework (framer-motion for UI elements)
- No additional game engines required

### Integration Points
- Existing starfield canvas system
- Consolidated RAF loop (ADR-001)
- Spatial partitioning quadtree (ADR-002) for collision detection
- Theme system for spaceship styling
- Portfolio data for planet/sun interactions

---

## 7. Dependencies

### Internal Dependencies
- ADR-001: Consolidated RAF loop must be implemented
- ADR-002: Quadtree spatial partitioning (for efficient collision detection)
- Current starfield rendering system
- Camera system for viewport tracking
- Theme system for visual consistency

### External Dependencies
- None (self-contained feature)

### Prerequisites
- Performance optimization of base starfield (maintain 60fps with game layer)
- Spaceship asset creation (SVG or sprite)
- Input handling architecture review

---

## 8. Success Metrics

### Key Performance Indicators (KPIs)
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Avg. session duration | ~2 min | +50% (3 min) | Analytics tracking |
| Game mode activation rate | N/A | 25% of visitors | Event tracking |
| User engagement (return visits) | Baseline | +20% | User analytics |
| Frame rate during gameplay | N/A | >55 FPS | Performance monitoring |
| Bounce rate | Baseline | -15% | Analytics tracking |

### User Acceptance Criteria
- [ ] Users can toggle game mode on/off without page reload
- [ ] Spaceship controls are responsive and intuitive
- [ ] No performance degradation compared to base starfield
- [ ] Collision detection works accurately
- [ ] Feature works on major desktop browsers
- [ ] Tutorial is clear and helpful for first-time users

---

## 9. Timeline

### Phase 1: Core Mechanics (4 weeks)
**Duration:** 4 weeks
- [ ] Implement spaceship entity and rendering
- [ ] Add keyboard input handling
- [ ] Create basic physics (movement, acceleration)
- [ ] Add game mode toggle UI
- [ ] Implement camera follow system

### Phase 2: Polish & Interactions (3 weeks)
**Duration:** 3 weeks
- [ ] Add collision detection with planets/suns
- [ ] Implement particle effects for thrust
- [ ] Create tutorial/help overlay
- [ ] Add sound effects (optional toggle)
- [ ] Implement disclaimer modal

### Phase 3: Testing & Optimization (2 weeks)
**Duration:** 2 weeks
- [ ] Performance testing and optimization
- [ ] Cross-browser testing
- [ ] User testing and feedback incorporation
- [ ] Bug fixes and edge case handling
- [ ] Documentation and launch preparation

---

## 10. Open Questions

### Technical Questions
- [ ] **Q:** Should spaceship use sprite-based or procedural rendering?
  - **Status:** Open
  - **Notes:** Sprite is simpler, procedural allows dynamic theming

- [ ] **Q:** What physics model should be used (arcade vs realistic)?
  - **Status:** Open
  - **Notes:** Arcade is more fun, realistic is more impressive

- [ ] **Q:** Should game mode state persist across sessions?
  - **Status:** Under Discussion
  - **Notes:** Could be annoying if user forgets it's enabled

### Product Questions
- [ ] **Q:** Should game mode be discoverable or require user to find it?
  - **Status:** Open
  - **Notes:** Balance between surprise and discoverability

- [ ] **Q:** What happens when spaceship reaches a portfolio company?
  - **Status:** Under Discussion
  - **Notes:** Options: popup, redirect, special animation

---

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Performance degradation | High | Medium | Extensive performance testing, frame rate monitoring, graceful degradation |
| User confusion about purpose | Medium | Medium | Clear tutorial, intuitive controls, obvious toggle |
| Mobile experience issues | Medium | High | Show disclaimer, recommend desktop, potentially disable on mobile |
| Distraction from main content | Medium | Low | Easy exit, subtle integration, time limits or auto-disable |
| Browser compatibility issues | High | Low | Progressive enhancement, feature detection, fallback messaging |

---

## 12. Alternatives Considered

### Alternative 1: Mouse-based Flight Controls
**Description:** Use mouse position for spaceship direction instead of keyboard
**Pros:** More intuitive for some users, touch-friendly
**Cons:** Less precise control, conflicts with existing hover interactions
**Decision:** Rejected - keyboard provides better control precision

### Alternative 2: Auto-pilot Tour Mode
**Description:** Spaceship flies automatically through portfolio
**Pros:** No user input required, works on all devices
**Cons:** Less engaging, no interactivity
**Decision:** Could be Phase 4 addition as "guided tour"

### Alternative 3: Full 3D Flight Simulator
**Description:** Use Three.js for 3D spaceship navigation
**Pros:** More impressive visually, depth perception
**Cons:** Significantly more complex, performance concerns, steeper learning curve
**Decision:** Rejected - 2D is sufficient and more performant

---

## 13. References

- [Mobile & Game Mode Considerations](../MOBILE_GAME_MODE_CONSIDERATIONS.md)
- [ADR-001: Consolidated RAF Loop](../adr/001-consolidated-raf-loop.md)
- [ADR-002: Quadtree Spatial Partitioning](../adr/002-spatial-partitioning-quadtree.md)
- Design mockups: TBD
- User research: TBD

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-08 | 0.1 | AI Agent | Initial draft based on feature requirements |
