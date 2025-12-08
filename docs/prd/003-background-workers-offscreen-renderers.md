# PRD-003: Background Workers & Offscreen Renderers

## Status
**Draft**

## Metadata
- **Created:** 2025-12-08
- **Last Updated:** 2025-12-08
- **Owner:** Phoenix VC Development Team
- **Stakeholders:** Development Team, Performance Engineering
- **Target Release:** Q3 2025

---

## 1. Overview

### Summary
Implement Web Workers and OffscreenCanvas to move computationally intensive operations (physics calculations, particle systems, rendering) off the main thread, improving performance and responsiveness of the starfield visualization.

### Goals
- Improve UI responsiveness by offloading heavy computations
- Achieve consistent 60 FPS even with complex physics and many celestial bodies
- Reduce main thread blocking for smoother user interactions
- Enable more advanced features without performance penalties

### Non-Goals
- Rewrite entire application in workers
- Support for browsers without Web Worker support
- Real-time collaborative features using workers
- Server-side rendering optimization

---

## 2. Motivation

### Business Value
Performance is a key factor in user experience and SEO rankings. By leveraging modern browser APIs, Phoenix VC can deliver a premium experience that loads faster and runs smoother than competitor websites, reinforcing the brand's commitment to cutting-edge technology.

### User Need
Users expect websites to remain responsive even with rich visualizations:
- Smooth scrolling without jank
- Instant response to button clicks and interactions
- No frame drops during animations
- Ability to interact with UI while heavy computations run

### Current Pain Points
- Physics calculations (PRD-002) block the main thread
- Complex rendering operations cause frame drops
- UI becomes unresponsive during heavy computation
- Browser may show "page unresponsive" warnings with many bodies
- Mobile devices struggle with current implementation

---

## 3. User Stories

### Primary User Stories
1. **As a** website visitor,
   **I want** the site to remain responsive during complex animations,
   **So that** I can navigate and interact without delays

2. **As a** user on a lower-end device,
   **I want** the visualization to run smoothly,
   **So that** I can enjoy the experience without lag

3. **As a** user scrolling the page,
   **I want** smooth scrolling even with the starfield active,
   **So that** navigation feels natural

4. **As a** developer,
   **I want** to add more complex features without worrying about blocking the main thread,
   **So that** innovation isn't limited by performance constraints

### Edge Cases
- User navigates away while worker is processing
- Worker encounters error during computation
- Browser doesn't support OffscreenCanvas
- Multiple workers competing for CPU resources
- Worker state synchronization after page reload

---

## 4. Functional Requirements

### Must Have (P0)
- [ ] Physics calculations moved to Web Worker
- [ ] Message passing system between main thread and workers
- [ ] Worker lifecycle management (create, terminate, error handling)
- [ ] Fallback to main thread for unsupported browsers
- [ ] State synchronization between main thread and worker
- [ ] Worker pool management for multiple concurrent tasks

### Should Have (P1)
- [ ] OffscreenCanvas for rendering (where supported)
- [ ] Particle system calculations in worker
- [ ] Quadtree building in worker
- [ ] Worker performance monitoring and metrics
- [ ] Transferable objects for efficient data passing
- [ ] Worker code splitting and lazy loading

### Nice to Have (P2)
- [ ] SharedArrayBuffer for zero-copy communication
- [ ] WASM integration for physics calculations
- [ ] Dynamic worker count based on CPU cores
- [ ] Worker debugging tools and visualization
- [ ] Hot reload for worker code during development
- [ ] Worker caching strategy

---

## 5. Non-Functional Requirements

### Performance
- Main thread should remain at <50% utilization
- Worker message passing latency <5ms
- No visible frame drops during worker transitions
- Memory usage increase <20MB for worker overhead
- Startup time for workers <100ms

### Security
- Workers run in sandboxed environment
- No sensitive data passed to workers
- Worker code integrity validation
- CSP (Content Security Policy) compliance for worker scripts

### Accessibility
- Worker failures should not break the site
- Graceful degradation to main thread rendering
- No accessibility features depend on workers

### Browser Support
- Web Workers: All modern browsers
- OffscreenCanvas: Progressive enhancement (Chrome 69+, Firefox 105+)
- Transferable objects: All modern browsers
- SharedArrayBuffer: Optional (additional security requirements)

---

## 6. Technical Considerations

### Architecture

```
┌────────────────────────────────────────────────────┐
│                   Main Thread                      │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │     UI      │  │   Canvas    │  │   State   │  │
│  │  Rendering  │  │  Composite  │  │   Mgmt    │  │
│  └──────┬──────┘  └──────▲──────┘  └─────┬─────┘  │
│         │                 │                │        │
│         └─────────────────┼────────────────┘        │
│                           │                         │
│                    Message Passing                  │
│                           │                         │
└───────────────────────────┼─────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────┐
│                    Worker Thread(s)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │   Physics   │  │  Quadtree   │  │ Offscreen │  │
│  │   Engine    │  │   Builder   │  │  Render   │  │
│  └─────────────┘  └─────────────┘  └───────────┘  │
└────────────────────────────────────────────────────┘
```

### Message Passing Strategy

#### Transferable Objects
```typescript
// Use transferable objects for large data structures
const bodies = new Float32Array(bodyCount * 4); // x, y, vx, vy
worker.postMessage({ type: 'UPDATE_BODIES', bodies }, [bodies.buffer]);
```

#### Message Types
```typescript
enum WorkerMessageType {
  INIT = 'INIT',
  UPDATE_PHYSICS = 'UPDATE_PHYSICS',
  BUILD_QUADTREE = 'BUILD_QUADTREE',
  RENDER_FRAME = 'RENDER_FRAME',
  TERMINATE = 'TERMINATE'
}

interface WorkerMessage {
  type: WorkerMessageType;
  payload: any;
  timestamp: number;
  transferables?: Transferable[];
}
```

### Key Components
- **WorkerManager:** Creates, manages, and terminates worker instances
- **MessageBus:** Handles communication between main thread and workers
- **StateSerializer:** Efficiently serializes/deserializes state for workers
- **WorkerPool:** Manages multiple workers for parallel processing
- **OffscreenCanvasManager:** Manages offscreen rendering when available

### Technology Stack
- Web Workers API (standard)
- OffscreenCanvas API (progressive enhancement)
- Transferable Objects (ArrayBuffer, MessagePort)
- Comlink (optional, for RPC-style worker communication)
- TypeScript (shared types between main thread and workers)

### Integration Points
- Physics engine (PRD-002) - primary worker workload
- Quadtree builder (ADR-002) - can run in worker
- Animation system (ADR-001) - coordinates worker output
- Particle systems - calculations in worker
- Game mode (PRD-001) - spaceship physics in worker

---

## 7. Dependencies

### Internal Dependencies
- ADR-001: Consolidated RAF loop (main thread coordinates)
- ADR-002: Quadtree implementation (can move to worker)
- PRD-002: Physics engine (primary candidate for worker)
- Build system (needs to bundle worker code)

### External Dependencies
- Optional: Comlink library for easier worker RPC
- Optional: WorkerDOM for DOM access in workers (future)

### Prerequisites
- TypeScript configuration for worker compilation
- Build process for worker bundling
- Error handling and logging infrastructure
- Performance monitoring setup

---

## 8. Success Metrics

### Key Performance Indicators (KPIs)
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Main thread utilization | ~80% | <50% | Chrome DevTools |
| Frame drops per minute | ~10 | <1 | Performance API |
| Time to interactive (TTI) | Baseline | -30% | Lighthouse |
| Physics calculation time | ~8ms | <2ms (worker) | Profiling |
| UI responsiveness score | Baseline | 95+ | Web Vitals |

### User Acceptance Criteria
- [ ] No visible UI jank during physics calculations
- [ ] Smooth scrolling maintained during animations
- [ ] Button clicks respond within 50ms
- [ ] Graceful fallback on unsupported browsers
- [ ] No worker-related errors in production
- [ ] Memory usage remains stable over time

---

## 9. Timeline

### Phase 1: Foundation (3 weeks)
**Duration:** 3 weeks
- [ ] Design worker architecture and message protocol
- [ ] Set up worker build pipeline
- [ ] Implement WorkerManager and MessageBus
- [ ] Create physics worker prototype
- [ ] Add fallback mechanism

### Phase 2: Physics Migration (2 weeks)
**Duration:** 2 weeks
- [ ] Move physics calculations to worker
- [ ] Implement efficient state synchronization
- [ ] Add transferable object optimization
- [ ] Test and tune performance
- [ ] Handle worker lifecycle and errors

### Phase 3: OffscreenCanvas (3 weeks)
**Duration:** 3 weeks
- [ ] Implement OffscreenCanvas rendering
- [ ] Move particle systems to worker
- [ ] Optimize rendering pipeline
- [ ] Add progressive enhancement for browsers without support
- [ ] Performance testing and optimization

### Phase 4: Advanced Features (2 weeks)
**Duration:** 2 weeks
- [ ] Implement worker pool for parallel processing
- [ ] Add SharedArrayBuffer optimization (if feasible)
- [ ] Create worker debugging tools
- [ ] Documentation and best practices
- [ ] Final performance tuning

---

## 10. Open Questions

### Technical Questions
- [ ] **Q:** Should we use a worker library (Comlink) or raw API?
  - **Status:** Open
  - **Notes:** Comlink simplifies RPC but adds bundle size

- [ ] **Q:** How to handle worker failures gracefully?
  - **Status:** Under Discussion
  - **Notes:** Could restart worker or fall back to main thread

- [ ] **Q:** Should workers be shared across page instances?
  - **Status:** Open
  - **Notes:** SharedWorker is possible but less supported

- [ ] **Q:** How to debug worker code effectively?
  - **Status:** Open
  - **Notes:** Chrome DevTools supports worker debugging but need workflow

### Product Questions
- [ ] **Q:** What's the fallback experience for unsupported browsers?
  - **Status:** Under Discussion
  - **Notes:** May need to reduce feature complexity

- [ ] **Q:** Should we show a loading state while workers initialize?
  - **Status:** Open
  - **Notes:** Workers should be fast enough to not need loading state

---

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Browser compatibility issues | High | Medium | Feature detection, graceful fallback, extensive testing |
| Increased complexity | Medium | High | Clear abstractions, documentation, shared types |
| Debugging difficulty | Medium | High | Better tooling, logging, worker inspector |
| Message passing overhead | High | Low | Use transferables, batch messages, profile carefully |
| Worker memory leaks | High | Medium | Proper lifecycle management, monitoring, periodic restart |
| State synchronization bugs | High | Medium | Immutable data structures, clear ownership, extensive testing |

---

## 12. Alternatives Considered

### Alternative 1: Keep Everything on Main Thread
**Description:** Optimize existing main thread code instead of using workers
**Pros:** Simpler architecture, no message passing overhead
**Cons:** Limited by single thread, UI will always compete with computation
**Decision:** Rejected - doesn't solve fundamental constraint

### Alternative 2: WebAssembly for Physics
**Description:** Compile physics engine to WASM for speed
**Pros:** Very fast, can run on main thread or worker
**Cons:** Complex build process, harder to debug, still blocks if on main thread
**Decision:** Could be Phase 5 optimization after workers

### Alternative 3: Server-Side Computation
**Description:** Calculate physics on server, stream results to client
**Pros:** No client-side performance impact
**Cons:** Latency, scalability issues, requires backend infrastructure
**Decision:** Rejected - too much complexity for this use case

### Alternative 4: Reduce Complexity Instead
**Description:** Simplify visualization to avoid performance issues
**Pros:** Much simpler
**Cons:** Less impressive, doesn't showcase technology
**Decision:** Rejected - doesn't align with brand goals

---

## 13. References

- Web Workers API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
- OffscreenCanvas: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
- Transferable Objects: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
- Comlink: https://github.com/GoogleChromeLabs/comlink
- [ADR-001: Consolidated RAF Loop](../adr/001-consolidated-raf-loop.md)
- [ADR-002: Quadtree Spatial Partitioning](../adr/002-spatial-partitioning-quadtree.md)
- [PRD-002: Physics & Math Calculations](./002-physics-math-calculations.md)
- High Performance Browser Networking (book) - Ilya Grigorik

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-08 | 0.1 | AI Agent | Initial draft based on feature requirements |
