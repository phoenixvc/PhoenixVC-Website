# PRD-005: Zoom Functionality

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
Implement comprehensive zoom functionality for the cosmic starfield visualization, allowing users to zoom in on individual celestial bodies, explore details, and navigate the cosmos at different scales with smooth transitions and intuitive controls.

### Goals
- Enable users to zoom in/out of the starfield at multiple levels
- Provide smooth, animated zoom transitions
- Allow zooming to specific celestial bodies (planets, suns)
- Maintain performance and visual quality at all zoom levels
- Create intuitive zoom controls (mouse wheel, buttons, keyboard)

### Non-Goals
- Infinite zoom (practical limits will be set)
- Fractal-level detail generation
- 3D zoom/perspective changes
- Zoom-dependent content loading (LOD system)

---

## 2. Motivation

### Business Value
Zoom functionality enhances the immersive quality of the website, allowing visitors to explore Phoenix VC's portfolio in greater depth. It creates opportunities for hidden details and Easter eggs that reward engaged users, increasing time on site and memorability.

### User Need
Users expect modern interactive visualizations to support zoom:
- Explore details of interest
- Navigate large spaces efficiently
- Focus attention on specific elements
- Experience sense of scale and depth

### Current Pain Points
- Fixed zoom level limits exploration
- No way to focus on specific portfolio companies
- Large starfield difficult to navigate
- Details invisible at default zoom level
- No sense of scale or depth in the visualization

---

## 3. User Stories

### Primary User Stories
1. **As a** website visitor,
   **I want** to zoom in using my mouse wheel,
   **So that** I can see details of celestial bodies

2. **As a** user,
   **I want** to click on a planet or sun to zoom to it,
   **So that** I can quickly focus on portfolio companies of interest

3. **As a** user exploring the starfield,
   **I want** smooth zoom animations,
   **So that** I maintain spatial awareness and don't get disoriented

4. **As a** keyboard user,
   **I want** keyboard shortcuts for zoom,
   **So that** I can navigate without a mouse

5. **As a** mobile user,
   **I want** pinch-to-zoom gestures,
   **So that** I can use familiar touch interactions

### Edge Cases
- Zooming in beyond maximum detail level
- Zooming out beyond starfield boundaries
- Rapid zoom changes (wheel spam)
- Zooming during other animations
- Zoom during game mode (PRD-001)
- Concurrent zoom from multiple input sources

---

## 4. Functional Requirements

### Must Have (P0)
- [ ] Mouse wheel zoom (scroll to zoom in/out)
- [ ] Zoom centered on cursor position
- [ ] Smooth zoom animations (eased transitions)
- [ ] Minimum and maximum zoom levels
- [ ] Zoom control buttons (UI: + and - buttons)
- [ ] Keyboard shortcuts (+ / - keys, or Ctrl + scroll)
- [ ] Reset zoom button (return to default view)
- [ ] Zoom state persistence during page interactions

### Should Have (P1)
- [ ] Double-click to zoom in on clicked location
- [ ] Click celestial body to zoom to it (animated)
- [ ] Pinch-to-zoom for touch devices
- [ ] Zoom level indicator (UI widget showing current zoom)
- [ ] Pan while zoomed (click and drag to move viewport)
- [ ] Zoom limits that adapt to content (don't zoom past boundaries)
- [ ] Smooth zoom transition curves (ease-in-out)

### Nice to Have (P2)
- [ ] Minimap showing zoomed area context
- [ ] Zoom breadcrumbs (navigation trail)
- [ ] Preset zoom levels (overview, detail, macro)
- [ ] Zoom speed configuration (user preference)
- [ ] Fisheye lens effect for local zoom
- [ ] Zoom history (back/forward buttons)
- [ ] Animated zoom tours (auto-zoom through interesting points)

---

## 5. Non-Functional Requirements

### Performance
- Zoom operations must maintain 60 FPS
- Zoom transition duration: 300-800ms (configurable)
- Level of detail adjustments at different zoom levels
- Canvas redraw optimizations for zoomed views
- Memory usage stable across zoom levels

### Security
- Input validation for zoom values
- Prevent zoom level manipulation via URL parameters
- Rate limiting for rapid zoom changes

### Accessibility
- Keyboard-only zoom navigation
- Screen reader announcements for zoom level changes
- Respect prefers-reduced-motion for zoom animations
- High contrast zoom UI controls
- Focus management during zoom transitions

### Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Touch events for mobile browsers
- Pointer events for unified input handling
- Graceful degradation for older browsers

---

## 6. Technical Considerations

### Architecture

```
┌────────────────────────────────────────────┐
│            Zoom System                     │
│                                            │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Zoom       │      │   Camera     │   │
│  │   Controller │─────▶│   Transform  │   │
│  └──────────────┘      └──────────────┘   │
│         ▲                      │           │
│         │                      ▼           │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Input      │      │   Renderer   │   │
│  │   Handlers   │      │   (scaled)   │   │
│  └──────────────┘      └──────────────┘   │
└────────────────────────────────────────────┘
```

### Zoom Mathematics

#### Zoom Transform Matrix
```typescript
// Camera transform with zoom
interface Camera {
  x: number;        // Camera position X
  y: number;        // Camera position Y
  zoom: number;     // Zoom level (1.0 = default)
  targetZoom: number; // Target zoom for animation
}

// Transform from world space to screen space
function worldToScreen(worldPos: Vec2, camera: Camera): Vec2 {
  return {
    x: (worldPos.x - camera.x) * camera.zoom + screenWidth / 2,
    y: (worldPos.y - camera.y) * camera.zoom + screenHeight / 2
  };
}

// Transform from screen space to world space
function screenToWorld(screenPos: Vec2, camera: Camera): Vec2 {
  return {
    x: (screenPos.x - screenWidth / 2) / camera.zoom + camera.x,
    y: (screenPos.y - screenHeight / 2) / camera.zoom + camera.y
  };
}
```

#### Zoom Animation
```typescript
// Smooth zoom using easing function
function updateZoom(camera: Camera, deltaTime: number): void {
  const zoomSpeed = 3.0; // Adjust for faster/slower zoom
  const diff = camera.targetZoom - camera.zoom;
  
  if (Math.abs(diff) > 0.001) {
    camera.zoom += diff * zoomSpeed * deltaTime;
  } else {
    camera.zoom = camera.targetZoom;
  }
}

// Easing function for smooth transitions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
```

#### Zoom to Target
```typescript
// Zoom to specific celestial body
function zoomToBody(camera: Camera, body: CelestialBody, targetZoom: number): void {
  // Calculate camera position to center body
  camera.targetX = body.x;
  camera.targetY = body.y;
  camera.targetZoom = targetZoom;
  
  // Animate transition in RAF loop
  animateCamera(camera);
}
```

### Key Components
- **ZoomController:** Manages zoom state and transitions
- **CameraSystem:** Handles camera position and zoom level
- **InputHandler:** Processes zoom input from various sources
- **ZoomUI:** Renders zoom controls and indicators
- **PanController:** Handles panning when zoomed

### Technology Stack
- Canvas transformation matrix
- requestAnimationFrame for smooth animations
- Pointer Events API for unified input
- CSS transforms for UI elements

### Integration Points
- Existing camera system (needs enhancement for zoom)
- ADR-001: RAF loop (zoom updates in camera phase)
- Rendering system (must respect camera zoom)
- PRD-001: Game mode (zoom affects spaceship scale)
- PRD-004: Orbit interactions (zoom affects click precision)

---

## 7. Dependencies

### Internal Dependencies
- ADR-001: Consolidated RAF loop (zoom animation runs here)
- Camera system (needs zoom capability)
- Rendering system (must support scaled rendering)
- Input handling system

### External Dependencies
- None (uses native browser APIs)

### Prerequisites
- Camera system architecture review
- Performance baseline for scaled rendering
- Input handling refactor for multi-source zoom

---

## 8. Success Metrics

### Key Performance Indicators (KPIs)
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Zoom feature usage | N/A | 50% of users | Event tracking |
| Avg. zoom interactions per session | N/A | 8+ | Analytics |
| Frame rate during zoom | N/A | >55 FPS | Performance monitoring |
| Zoom transition smoothness | N/A | 95% smooth | User surveys |
| Time exploring zoomed views | N/A | +2 minutes | Analytics |

### User Acceptance Criteria
- [ ] Smooth, responsive zoom on all input methods
- [ ] Zoom maintains spatial context (no disorientation)
- [ ] Performance is consistent at all zoom levels
- [ ] Zoom controls are intuitive and discoverable
- [ ] Touch zoom works naturally on mobile
- [ ] Keyboard users can fully control zoom

---

## 9. Timeline

### Phase 1: Core Zoom Mechanics (2 weeks)
**Duration:** 2 weeks
- [ ] Implement camera zoom state
- [ ] Add mouse wheel zoom
- [ ] Create zoom animation system
- [ ] Set min/max zoom limits
- [ ] Add zoom UI controls

### Phase 2: Enhanced Navigation (2 weeks)
**Duration:** 2 weeks
- [ ] Implement pan while zoomed
- [ ] Add double-click to zoom
- [ ] Create zoom-to-target functionality
- [ ] Add keyboard shortcuts
- [ ] Implement zoom level indicator

### Phase 3: Touch & Polish (2 weeks)
**Duration:** 2 weeks
- [ ] Add pinch-to-zoom for touch devices
- [ ] Optimize rendering at different zoom levels
- [ ] Add visual polish and transitions
- [ ] Create minimap (optional)
- [ ] User testing and refinement

### Phase 4: Integration & Testing (1 week)
**Duration:** 1 week
- [ ] Integration with game mode
- [ ] Integration with orbit interactions
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Documentation

---

## 10. Open Questions

### Technical Questions
- [ ] **Q:** Should zoom level affect physics simulation scale?
  - **Status:** Open
  - **Notes:** May need to adjust time scale at extreme zoom

- [ ] **Q:** How to handle very large zoom ranges efficiently?
  - **Status:** Under Discussion
  - **Notes:** May need LOD system for extreme zoom

- [ ] **Q:** Should zoom be constrained by starfield boundaries?
  - **Status:** Open
  - **Notes:** Could allow zooming beyond and show empty space

### Product Questions
- [ ] **Q:** What should be the default zoom level?
  - **Status:** Under Discussion
  - **Notes:** Balance between overview and detail

- [ ] **Q:** Should zoom state persist across page navigation?
  - **Status:** Open
  - **Notes:** Could be confusing but also convenient

- [ ] **Q:** How to educate users about zoom capability?
  - **Status:** Open
  - **Notes:** Subtle UI hint vs explicit tutorial

---

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Performance degradation at high zoom | High | Medium | LOD system, rendering optimizations, limit max zoom |
| User disorientation during zoom | Medium | High | Smooth animations, context preservation, minimap |
| Touch zoom conflicts with scroll | Medium | High | Proper event handling, clear touch affordances |
| Zoom makes click targets too small | Medium | Medium | Hit box scaling, visual feedback, minimum sizes |
| Memory usage with detailed rendering | Medium | Low | Canvas size limits, efficient rendering pipeline |

---

## 12. Alternatives Considered

### Alternative 1: Discrete Zoom Levels
**Description:** Zoom to predefined levels (1x, 2x, 4x) instead of continuous
**Pros:** Simpler implementation, predictable behavior
**Cons:** Less natural, doesn't match user expectations
**Decision:** Rejected - continuous zoom is standard

### Alternative 2: Semantic Zoom (Different Content at Different Levels)
**Description:** Show different information based on zoom level
**Pros:** Can optimize content for each level, hide complexity
**Cons:** Very complex to implement, may confuse users
**Decision:** Could be Phase 5 enhancement

### Alternative 3: No Zoom, Just Better Initial View
**Description:** Optimize default view instead of adding zoom
**Pros:** Much simpler, no new features to maintain
**Cons:** Doesn't solve exploration needs, less engaging
**Decision:** Rejected - zoom is expected feature

---

## 13. References

- Canvas transformation matrix: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
- Pointer Events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- Touch Events: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
- [ADR-001: Consolidated RAF Loop](../adr/001-consolidated-raf-loop.md)
- [PRD-001: Game Mode with Spaceships](./001-game-mode-spaceships.md)
- [PRD-004: Planet Orbit Interactions](./004-planet-orbit-interactions.md)
- Google Maps zoom interaction patterns
- Figma canvas navigation (inspiration)

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-08 | 0.1 | AI Agent | Initial draft based on feature requirements |
