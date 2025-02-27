# ADR 0002: Disaster Recovery Approach {: #adr-0002-disaster-recovery-approach}
**Status:** PROPOSED
**Effective:** TBD
**Review Cycle:** 6 months

## Context {: #context}
- Our current disaster recovery (DR) plan requires a high-level architectural decision record to outline how we ensure business continuity.
- A detailed DR runbook exists in [infrastructure/disaster-recovery.md](./infrastructure/disaster-recovery.md), but we need an ADR to document the guiding principles and decisions behind the DR strategy.

## Decision {: #decision}
- We will adopt an **active-passive DR model** with region failover, leveraging Azure Front Door for traffic management.
- **Recovery Point Objective (RPO):** Less than 15 minutes
- **Recovery Time Objective (RTO):** Less than 1 hour for production workloads

## Consequences {: #consequences}
### Positive {: #positive}
- **Minimized Downtime:** Reduces the impact of a regional outage.
- **Compliance:** Meets regulatory requirements for business continuity and disaster recovery.
- **Cost Efficiency:** Only standby resources are maintained, keeping additional costs in check.

### Negative {: #negative}
- **Additional Costs:** Maintaining a standby region increases infrastructure costs.
- **Complexity:** Implementing automated region failover adds complexity to the overall architecture.
- **Testing Overhead:** Regular DR drills are required to ensure the plan is effective.

## Validation {: #validation}
- **Monthly DR Drills:** Regular tests to verify failover procedures and RTO/RPO targets.
- **Cost Monitoring:** Quarterly reviews to assess the cost impact of maintaining standby resources.
- **Audit & Reporting:** Integration with our monitoring and alerting systems to automatically report DR readiness.

## Sunset Clause {: #sunset-clause}
- This DR approach may be revisited if an **active-active** strategy becomes cost-effective and aligns better with traffic patterns, potentially reducing failover times further.

## Revision History {: #revision-history}
| Version | Date       | Author    | Changes         |
|---------|------------|-----------|-----------------|
| 1.0     | 2025-02-14 | HJ Smit   | Proposed draft  |

## TODO {: #todo}
- [ ] Expand on the technical details of the region failover process.
- [ ] Include links to any runbooks or playbooks used during DR drills.
- [ ] Define roles and responsibilities during a DR event.
