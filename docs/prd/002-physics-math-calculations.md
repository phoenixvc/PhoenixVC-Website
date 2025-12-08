# PRD-002: Physics & Math Calculations - Size/Weight Sensitivity

## Status
**Draft**

## Metadata
- **Created:** 2025-12-08
- **Last Updated:** 2025-12-08
- **Owner:** Phoenix VC Development Team
- **Stakeholders:** Product Team, Development Team, Design Team
- **Target Release:** Q2 2025

---

## 1. Overview

### Summary
Implement realistic physics calculations for celestial bodies (stars, suns, planets) in the starfield visualization, including gravitational effects, size-based mass calculations, and dynamic interactions that respond to object properties.

### Goals
- Create a more scientifically accurate and visually compelling starfield
- Implement gravitational attraction between celestial bodies
- Add size/mass-based physics that affects movement and interactions
- Enhance the immersive quality of the cosmic visualization

### Non-Goals
- Full N-body physics simulation (computationally expensive)
- Relativistic physics or quantum effects
- Real-time orbital mechanics calculations
- Scientifically accurate scale (artistic license for visibility)

---

## 2. Motivation

### Business Value
Adding realistic physics demonstrates Phoenix VC's attention to detail and commitment to quality. It creates a more engaging and believable cosmic environment that reflects the sophistication of the firm's approach to venture capital.

### User Need
Users expect modern web experiences to feel dynamic and responsive. Physics-based interactions:
- Make the visualization feel alive and organic
- Create emergent, unpredictable beauty
- Reward exploration with dynamic discoveries
- Provide visual interest that keeps users engaged

### Current Pain Points
- Celestial bodies move in fixed, predictable patterns
- No interaction between stars, suns, and planets
- Size differences are purely cosmetic
- Visualization feels static despite animation
- No gravitational or physics-based effects

---

## 3. User Stories

### Primary User Stories
1. **As a** website visitor,
   **I want** to see larger celestial bodies attract smaller ones,
   **So that** the visualization feels more realistic and engaging

2. **As a** user observing the starfield,
   **I want** planets to orbit around their parent suns naturally,
   **So that** the cosmic theme feels authentic

3. **As a** user in game mode,
   **I want** my spaceship to be affected by gravitational forces,
   **So that** navigation feels challenging and physics-based

4. **As a** user,
   **I want** to see dynamic interactions when celestial bodies come close,
   **So that** I'm rewarded for watching the visualization over time

### Edge Cases
- Two large bodies approaching each other (gravitational slingshot)
- Very small bodies near very large bodies (capture or destruction)
- Multiple gravitational influences on a single body
- Performance with 500+ bodies under gravitational influence

---

## 4. Functional Requirements

### Must Have (P0)
- [ ] Mass calculation based on visual size (radius)
- [ ] Gravitational force calculation between bodies
- [ ] Force accumulation and application to velocity
- [ ] Configurable physics parameters (G constant, mass scale, etc.)
- [ ] Performance-optimized physics loop (60fps maintained)
- [ ] Spatial partitioning for efficient gravitational calculations

### Should Have (P1)
- [ ] Orbital mechanics for planets around suns
- [ ] Gravitational influence radius (bodies only affect nearby objects)
- [ ] Collision physics (elastic/inelastic collisions)
- [ ] Visual feedback for gravitational interactions (trails, distortions)
- [ ] Dampening factors to prevent chaotic behavior
- [ ] Configurable simulation speed (slow-mo, fast-forward)

### Nice to Have (P2)
- [ ] Tidal effects visualization
- [ ] Binary star systems with realistic orbital mechanics
- [ ] Planetary rings affected by gravity
- [ ] Gravitational lensing effect (light bending near massive objects)
- [ ] Roche limit calculations (objects breaking apart when too close)
- [ ] N-body simulation mode (toggle for advanced users)

---

## 5. Non-Functional Requirements

### Performance
- Maintain 60 FPS with up to 500 celestial bodies
- Physics calculations must complete within 8ms per frame
- Use spatial partitioning to reduce O(n²) gravity calculations
- Graceful degradation on lower-end devices (reduce body count or disable physics)

### Security
- No external physics engine dependencies (reduce attack surface)
- Validate all physics parameters to prevent numerical instability
- Prevent infinite loops in gravitational calculations

### Accessibility
- Physics effects are optional enhancements (don't affect content access)
- Provide toggle to disable physics for users with motion sensitivity
- Ensure reduced motion preference is respected

### Browser Support
- Modern browsers with Float32Array support
- WebGL not required but can be used for optimizations
- Fallback to simpler motion for older browsers

---

## 6. Technical Considerations

### Architecture
Physics system will be integrated into the consolidated RAF loop, with gravitational calculations using the quadtree for efficient neighbor queries.

```
┌────────────────────────────────────────────────┐
│         Physics Update Phase (RAF Loop)        │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  Calculate   │      │   Apply      │        │
│  │  Gravity     │─────▶│   Forces     │        │
│  │  Forces      │      │   to Bodies  │        │
│  └──────────────┘      └──────────────┘        │
│         │                      │                │
│         │                      ▼                │
│         │              ┌──────────────┐         │
│         │              │   Update     │         │
│         └─────────────▶│   Positions  │         │
│                        └──────────────┘         │
└────────────────────────────────────────────────┘
```

### Physics Calculations

#### Mass Formula
```typescript
// Mass proportional to volume (assuming uniform density)
mass = density * (4/3) * π * radius³

// Simplified for 2D representation
mass = densityConstant * radius²
```

#### Gravitational Force (Newton's Law)
```typescript
// Force between two bodies
F = G * (m1 * m2) / r²

// Vector form
F_vec = G * (m1 * m2) / r² * normalize(direction)
```

#### Acceleration and Velocity
```typescript
// Newton's second law: F = m * a
acceleration = force / mass

// Velocity update
velocity += acceleration * deltaTime

// Position update (Euler integration)
position += velocity * deltaTime
```

### Key Components
- **PhysicsEngine:** Core physics simulation manager
- **GravityCalculator:** Computes gravitational forces between bodies
- **CollisionDetector:** Detects and resolves collisions
- **OrbitManager:** Maintains stable orbital relationships
- **PhysicsConfig:** Configuration object for tuning physics parameters

### Technology Stack
- TypeScript for type-safe physics calculations
- Float32Array for efficient numerical computations
- Quadtree (ADR-002) for spatial partitioning
- Custom physics engine (no external dependencies)

### Integration Points
- Consolidated RAF loop (ADR-001)
- Quadtree spatial index (ADR-002)
- Celestial body rendering system
- Camera system (may need to track moving bodies)
- Game mode spaceship physics (PRD-001)

---

## 7. Dependencies

### Internal Dependencies
- ADR-001: Consolidated RAF loop (physics runs in update phase)
- ADR-002: Quadtree for efficient gravitational queries
- Existing celestial body data structures (stars, suns, planets)
- Performance monitoring infrastructure

### External Dependencies
- None (self-contained physics engine)

### Prerequisites
- Performance baseline established for current animation
- Celestial body size/mass properties defined
- Physics parameter tuning environment ready

---

## 8. Success Metrics

### Key Performance Indicators (KPIs)
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Frame rate with physics | N/A | >55 FPS | Performance monitoring |
| Physics calculation time | N/A | <8ms per frame | Profiling tools |
| User engagement time | ~2 min | +30% | Analytics |
| Visual appeal rating | Baseline | +40% | User surveys |
| CPU usage | Baseline | <+15% | Performance monitoring |

### User Acceptance Criteria
- [ ] Planets orbit smoothly around suns
- [ ] Gravitational interactions are visible and compelling
- [ ] No performance degradation on target hardware
- [ ] Physics behavior is stable (no runaway effects)
- [ ] Users can toggle physics on/off
- [ ] Reduced motion preference is respected

---

## 9. Timeline

### Phase 1: Foundation (3 weeks)
**Duration:** 3 weeks
- [ ] Design physics data structures
- [ ] Implement basic gravitational force calculations
- [ ] Create physics configuration system
- [ ] Add mass property to celestial bodies
- [ ] Integrate with RAF loop

### Phase 2: Orbital Mechanics (2 weeks)
**Duration:** 2 weeks
- [ ] Implement stable orbital calculations
- [ ] Add planet-sun orbital relationships
- [ ] Tune gravitational constant and parameters
- [ ] Add visual feedback for gravitational interactions
- [ ] Performance optimization

### Phase 3: Advanced Features (3 weeks)
**Duration:** 3 weeks
- [ ] Implement collision detection and response
- [ ] Add gravitational influence radius
- [ ] Create physics debug visualization
- [ ] Implement simulation speed controls
- [ ] Add reduced motion support

### Phase 4: Testing & Polish (2 weeks)
**Duration:** 2 weeks
- [ ] Performance testing across devices
- [ ] Parameter tuning for visual appeal
- [ ] Edge case testing and bug fixes
- [ ] User testing and feedback
- [ ] Documentation

---

## 10. Open Questions

### Technical Questions
- [ ] **Q:** Should we use Verlet integration for better stability?
  - **Status:** Open
  - **Notes:** More stable than Euler but more complex

- [ ] **Q:** How to handle very close encounters without numerical instability?
  - **Status:** Open
  - **Notes:** May need softening parameter in gravity formula

- [ ] **Q:** Should physics be deterministic (same seed = same result)?
  - **Status:** Under Discussion
  - **Notes:** Useful for debugging but may limit emergent behavior

### Product Questions
- [ ] **Q:** Should physics be enabled by default?
  - **Status:** Open
  - **Notes:** May be too intense for some users

- [ ] **Q:** What happens if all planets get ejected from the system?
  - **Status:** Open
  - **Notes:** Need reset mechanism or boundary conditions

- [ ] **Q:** Should we show physics information to users (velocities, forces)?
  - **Status:** Under Discussion
  - **Notes:** Could be educational but also cluttered

---

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Performance degradation | High | Medium | Extensive optimization, spatial partitioning, adjustable body count |
| Numerical instability | High | Medium | Use stable integration methods, softening parameters, bounds checking |
| Chaotic behavior | Medium | High | Careful parameter tuning, dampening factors, reset mechanism |
| User motion sickness | Medium | Low | Respect reduced motion, provide toggle, limit extreme accelerations |
| Increased complexity | Medium | High | Modular architecture, comprehensive testing, clear documentation |

---

## 12. Alternatives Considered

### Alternative 1: Use External Physics Engine (e.g., Matter.js)
**Description:** Integrate a mature physics library instead of building custom
**Pros:** Battle-tested, full-featured, less development time
**Cons:** Large bundle size, may have unnecessary features, less control
**Decision:** Rejected - Custom solution is lighter and more tailored

### Alternative 2: Simplified Attraction Forces (Non-Physics)
**Description:** Use simple attraction without proper physics
**Pros:** Much simpler to implement, better performance
**Cons:** Less realistic, no emergent behavior
**Decision:** Potential fallback if full physics too expensive

### Alternative 3: Pre-calculated Orbits
**Description:** Define orbits mathematically without simulation
**Pros:** Perfect stability, predictable, very performant
**Cons:** No dynamic interactions, less interesting
**Decision:** Could be used for initial stable state

---

## 13. References

- Newton's Law of Universal Gravitation: https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation
- Numerical Integration Methods: https://en.wikipedia.org/wiki/Verlet_integration
- [ADR-001: Consolidated RAF Loop](../adr/001-consolidated-raf-loop.md)
- [ADR-002: Quadtree Spatial Partitioning](../adr/002-spatial-partitioning-quadtree.md)
- [PRD-001: Game Mode with Spaceships](./001-game-mode-spaceships.md)
- Game Physics Engine Development (book) - Ian Millington
- Real-Time Collision Detection (book) - Christer Ericson

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-08 | 0.1 | AI Agent | Initial draft based on feature requirements |
