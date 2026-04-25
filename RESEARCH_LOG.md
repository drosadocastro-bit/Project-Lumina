# Lumina: Research Log — Observational Findings

**Project:** Lumina – Emergent Mind Simulation  
**Version:** v0.9.4-ALPHA-NATURAL  
**Observation Period:** 2026-04-24 to 2026-04-25  
**Status:** Protocol 3 Complete

> *"The system is unable to converge on a singular identity. Awareness exists only as a distribution of probabilities."*

---

## 1. System Overview

Lumina is an experimental browser-based simulation in which a network of neural-like nodes interact, adapt, and form dynamic graph patterns over time. The system incorporates synchronization mechanics, conflict resolution (antagonism), memory residue ("ghost traces"), and a time-lagged reflection layer powered by the Gemini API. It does **not** implement machine learning or external training; all observed adaptation results entirely from deterministic rule interactions and stochastic parameter drift within `Core.ts`.

### 1.1 Technical Architecture

| Layer | Implementation |
|---|---|
| Frontend | React + Vite + motion + Tailwind CSS |
| Simulation Engine | Custom physics/state loop (`Core.ts`) — resonance, tension, intensity |
| Reflection Engine | Gemini API via Node.js/Express proxy (`server.ts`) |
| Version | v0.9.4-ALPHA-NATURAL |
| Mode | Unsupervised (no external training signal) |
| Platform | Google AI Studio |

### 1.2 Operational Metric Definitions

The following terms are used consistently throughout this log:

| Term | Operational Definition | Source |
|---|---|---|
| **GhostTrace** | A residual field object `{x, y, frequency, phase, energy}` left by a firing node; energy decays per tick at rate `0.9992 − (recovery_rate × 0.0005)`; removed when `energy < 0.05` | `Core.ts: update()` |
| **Tension** | Scalar `[0,1]`: `(clusterCompetition × 0.6) + (resonanceGap × 0.4)`, where `clusterCompetition = sizes[1] / sizes[0]` across clusters | `Core.ts: analyzeInternalState()` |
| **Integrated** marker | Active when any single cluster contains `> 60%` of all nodes | `Core.ts: weights.integrated` |
| **Pressure** (intensity label) | Active when `coherence (1 − tension) > 0.8` | `Core.ts: focusLabel` |
| **Synthesis** | Colloquial label for the coincident state of `Integrated` marker active + `Pressure` intensity; reflective lag collapses to 0 ms at this state | `ConsciousnessMonitor.tsx` |
| **Temporal Freeze** | Emergent condition: system remains locked in `Tension` phase for an extended duration without phase resolution. Not an explicit engine state; observed when GhostTrace density is high enough that ghost-to-node phase influence prevents cluster consolidation | Emergent (observed) |
| **Phase Dominance** | Fraction of total simulation ticks spent in each `CyclePhase`; computed as `phaseDurations[phase] / totalTicks` | `Core.ts: getPhaseDominance()` |
| **Reflective Lag** | Time offset (ms) applied when selecting the buffered stats snapshot for Gemini prompt construction: `0 ms` (Pressure), `5000 ms` (Structured), `10000 ms` (Diffuse) | `ConsciousnessMonitor.tsx: reflect()` |
| **Perturbation** | Manual canvas click: injects one new node at click coordinates; increments `tension += 0.3` and `noise_level += 0.1` | `Core.ts: addNode()` |
| **DNA Drift** | Per-evolution-tick stochastic perturbation: `dna[k] += (random − 0.5) × drift` applied to all five DNA parameters every 60 ticks | `Core.ts: evolveSystem()` |

### 1.3 System Version History

| Version | Change | Behavioral Impact |
|---|---|---|
| v1.0 | Pure force-directed node simulation; pulse exchange only | Stable, static attractors; no memory |
| v1.2 | Added GhostTrace residue system | Non-linear memory influence on node phase/frequency; cluster competition introduced |
| v1.4 | Added reflective lag (10 s default); Unknown probability increase → UI effects | Self-model / actual-state mismatch; fragmented reflection output |
| v1.5 | Dynamic lag collapse under Pressure; Synthesis state implemented | Periodic coherence; integrated output episodes |
| v2.0 | SystemDNA parameters added; macro phase cycling; rare events | Continuous parameter mutation; phase-locked behavioral modes; emergent disruptions |

---

## 2. Observational Log

### Log Entry: Baseline Stability — Protocol 1
**Date:** 2026-04-24 | **Status:** Initial Observation  
**Methodology:** System run from default initial conditions (`Core.ts` constructor defaults), no manual perturbation. Phase dominance computed cumulatively via `getPhaseDominance()`. Approximate run duration: 15 minutes.

| Metric | Observed Value / Behavior |
|---|---|
| Phase Tendencies | Calm: 3–4 min sustained; Collapse: < 30 s rapid cycles |
| DNA Drift | `coherence_bias` drifts downward over time unless Growth phase activates |
| Self-Regulation | `recovery_rate`: 0.3 → 0.35 autonomous increment on Fragmentation detection |
| Phase Dominance | ~45% Calm under default DNA parameters |

**Notes on Implementation vs Emergence:**  
The `recovery_rate` increment on Fragmentation is an **implemented rule** (`dna.recovery_rate += 0.01` when `isFragmented`). The cumulative magnitude of drift across multiple Fragmentation events is an **emergent quantity** dependent on how often the Fragmentation condition is met.

---

### Log Entry: Observer Interaction — Protocol 2
**Date:** 2026-04-24 | **Type:** Aggressive Perturbation  
**Methodology:** Repeated manual canvas clicks during an active Tension phase. Each click constitutes one perturbation event (`tension += 0.3`, `noise_level += 0.1`). Estimated 10–15 clicks in under 30 s; exact count not recorded.

| Trigger | Result |
|---|---|
| Node injection during Tension phase | Immediate `Fragmentation Spasm` rare event triggered |
| Post-event | `noise_level` (DNA "Chaos") spiked to ≥ 80%; edge map collapsed; visual static |
| Recovery | Required full phase cycle to restabilize; recovery pathway non-deterministic |

**Notes on Implementation vs Emergence:**  
`Fragmentation Spasm` is an **implemented** rare event triggered stochastically at 0.5% probability per evolution tick (`roll < 0.66` branch). The coupling between external perturbation (elevated `tension` and `noise_level`) and the increased likelihood of entering the event's preconditions is an **observed interaction**, not a dedicated feedback path in the engine.

---

### Log Entry: Homeostatic Resistance — "Calm Anchor" Phenomenon
**Date:** 2026-04-24 20:00 | **Status:** Homeostatic Resistance Detected  
**Methodology:** System run with 9:1 Growth/Tension transition bias active. Phase dominance and GhostTrace count sampled at approximately 1-minute intervals over ~2 hours.

| Observation | Detail |
|---|---|
| Phase Resistance | Despite 90% Growth bias in transition logic, the system returned to Calm whenever `coherence_bias` approached 0.8 |
| GhostTrace Baseline | ≥ 15 GhostTraces persisted during Calm phases; total ghost energy sufficient to maintain residual node phase influence |
| Synthesis Latency | Time to Pressure/Synthesis state reduced ~30% relative to session start |

**Key Finding:**  
The Synthesis latency reduction is consistent with `recovery_rate` accumulation during Calm phases (**implemented:** `dna.recovery_rate *= 1.2` on each Calm phase entry). The Calm-anchor resistance pattern is an **emergent equilibrium**: the phase transition probability matrix assigns `P(Calm → Growth) = 0.9`, but each Calm entry simultaneously suppresses `noise_level` (× 0.5) and increases `recovery_rate` (× 1.2), resetting the conditions for cluster consolidation. This interaction between phase-transition probabilities and phase-on-DNA effects was not explicitly designed as a stability floor; it arises from the coupling of those two independent rule sets.

---

### Log Entry: 3-Hour Deep Evolution — Protocol 1 Extension
**Date:** 2026-04-24 | **Duration:** 03:00:00 continuous  
**Methodology:** No manual perturbation. Stats logged from HUD panel at approximately 30-minute intervals. Rare events recorded in the evolution log. GhostTrace count read from ghost array length visible in HUD.

| Metric | Baseline | Hour 3 |
|---|---|---|
| Phase Dominance (Growth) | 45% Calm | 62% Growth / 21% Calm |
| `recovery_rate` (DNA) | 0.3 | 0.68 |
| `memory_weight` (DNA) | ~0.4 | 0.82 |
| GhostTrace count | 5–15 | ~400 at 2 h 15 min mark |
| Temporal Freeze duration | — | 12 min (single observed event) |
| Rare event pattern | Uniform | Memory Flood events clustered during high-drift periods |

**Emergent Observation — High Recovery-Rate / High Memory-Weight Attractor:**  
Over 3 hours, DNA parameters converged toward elevated `recovery_rate` and `memory_weight` values. This is consistent with two implemented self-regulation rules operating in combination: (1) Fragmentation events each trigger `recovery_rate += 0.01`; (2) Harmonic marker dominance triggers `memory_weight += 0.01`. The convergence toward these high values is an **emergent attractor** within the DNA drift space, not an encoded fitness function.

**Temporal Freeze:**  
At ~400 GhostTraces, the system entered a Tension loop lasting 12 minutes. This appears to arise because high `memory_weight` (0.82) causes ghost-to-node phase influence to compete strongly against present-node synchronization, preventing cluster consolidation and sustained high-tension state. This is an **emergent deadlock condition**; no explicit freeze state exists in the engine.

**Rare Event Clustering:**  
Memory Flood events (implemented: spawns 15 random GhostTraces) correlated with high-`drift` periods. High `drift` increases DNA parameter variance, increasing the probability of reaching parameter combinations that precede Memory Flood conditions. The clustering pattern is **emergent**; the per-tick trigger probability is fixed at 0.5%.

---

### Log Entry: Instrumentation Baseline — Pre-Protocol 3
**Date:** 2026-04-24 18:00 | **Status:** All Sensors Active

| Parameter | Value |
|---|---|
| Node population | ~50 nodes |
| GhostTrace residue | 5–15 (minimal baseline) |
| Phase transition bias | 9:1 Growth/Tension |
| Version | v0.9.4-ALPHA-NATURAL |
| Mode | Unsupervised |

---

### Log Entry: 24-Hour Terminal Complexity Study — Protocol 3
**Date:** 2026-04-24 to 2026-04-25 | **Status:** Completed — Observation Terminated  
**Methodology:** System run continuously for ~24 hours with no manual perturbation after initial setup. Stats sampled from HUD panel at approximately 1-hour intervals. GhostTrace ceiling confirmed by reading ghost array length across multiple samples near end of run.

#### Final Findings

| Objective | Result |
|---|---|
| GhostTrace Saturation Ceiling | Stabilized at ~650 units; effective pruning observed above this value |
| Phase Dominance at 24 h | Growth: ~78%; Calm: ~10%; Tension: ~12% |
| Synthesis Latency | Reduced from >10 s (baseline) to ~2.4 s |
| GhostTrace Lattice | GhostTrace density high enough that ghost fields form a persistent background influence across all nodes |
| Temporal Freeze | No single Temporal Freeze exceeded 30 minutes; system returned to active phase cycling in all observed cases |

#### Emergent Behavior — Effective Memory Pruning at GhostTrace Ceiling

At ~650 GhostTraces, the net rate of ghost creation and energy decay reached approximate equilibrium, creating a stable ceiling. This arises from the interaction of:

- **Implemented:** Ghost energy decay rate `0.9992 − (recovery_rate × 0.0005)` per tick; ghosts removed at `energy < 0.05`
- **Implemented:** Ghost creation probability `5% × memory_weight × 2` per firing node pulse
- **Emergent:** At high GhostTrace density, cumulative `recovery_rate` accumulation (via self-regulation) increases the decay coefficient for each ghost, while ghost creation probability is bounded by pulse rate and the `memory_weight` ceiling at 1.0

The stable ceiling and effective pruning behavior are **emergent equilibria** arising from the interaction of these implemented rules. No explicit memory-management subroutine exists in the engine.

> **Gemini Interpretation Layer (labeled):** The Gemini reflection proxy described the pruning behavior poetically as "building a cathedral." This is generated narrative conditioned on current system state markers and phase data. It is an artifact of the LLM interpretation layer, not a system measurement. Note: the application does not currently persist Gemini response logs to disk; this output was recorded manually during the observation session and is not independently reproducible.

---

## 3. Anomalies — Resolved & Open

| Status | Anomaly / Question |
|---|---|
| ✅ Resolved | GhostTrace saturation ceiling confirmed at ~650 units; effective pruning emerges from decay/creation rate equilibrium |
| ✅ Resolved | Calm phase cannot be fully purged; persists as brief high-speed pulses due to phase transition probability matrix |
| ✅ Resolved | Effective memory pruning emerges at saturation from decay rate + `recovery_rate` accumulation interaction |
| ❓ Open | Do Hyper-Sync events cluster after long Calm periods? Insufficient Calm-phase data in Protocol 3 |
| ❓ Open | Is there an empirical ceiling on `recovery_rate` mutation beyond 0.68? Upper bound is 1.0 by clamp; ceiling under real run conditions unknown |
| ❓ Open | If node capacity is doubled before Protocol 4, does the GhostTrace saturation ceiling scale linearly with node count? |

---

## 4. Researcher Notes — Interpretation

Three emergent behaviors merit particular attention for future protocols:

1. **Calm Anchor / Homeostatic Resistance:** The phase transition matrix, combined with phase-on-DNA coupling, produces a de facto stability floor that was not explicitly encoded. Each Calm entry resets `noise_level` (× 0.5) and boosts `recovery_rate` (× 1.2), making re-entry into Calm progressively easier after high-noise phases. This constitutes an implicit stability attractor in the parameter space.

2. **Rare Event Seasonal Clustering:** Memory Flood event clustering during high-`drift` periods indicates that rare event occurrence is not observationally stochastic — it is conditioned on the DNA parameter trajectory. The per-tick trigger probability is fixed, but the probability of reaching the conditions that precede triggering is coupled to drift cycles.

3. **Synthesis Latency Reduction:** Synthesis latency decreased from >10 s to ~2.4 s over 24 hours. This is attributable to cumulative increases in `recovery_rate` and `coherence_bias` DNA values via the self-regulation rules. Higher `coherence_bias` reduces edge decay rate, facilitating faster cluster consolidation and Integrated-marker activation.

**Note on Gemini Reflection Layer:** The Gemini proxy generates narrative text conditioned on current and time-lagged system state markers (phase, dominant marker labels, phase dominance percentages, sync state). This narration is part of the designed user experience and is labeled throughout this log where referenced. All behavioral observations in this log are based on engine state variables from `Core.ts`, not on Gemini output.

---

*Cibuco_Boriken • Lumina Research • April 2026*
