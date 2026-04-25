# Lumina Observatory: Research Protocols

This document outlines the experimental framework for observing Lumina's emergent properties over long durations. Because Lumina is a non-deterministic, temporally evolving system, these protocols rely on observation rather than unit tests.

## 1. Tendency Development (Macro-Evolution)
**Hypothesis:** The system does not drift infinitely, but develops structural biases in DNA parameter space.  
**Protocol:**
- Run the simulation without interaction for 10-15 minutes.
- Observe the **Evolution DNA** panel.
- **Questions to answer:**
  - Does the system strongly favor high `coherence_bias` over time, or does it converge toward high `noise_level`?
  - Do `drift` values heavily bias the outcome, or does self-regulation (the `recovery_rate` increment on Fragmentation) maintain a stable operating range?

## 2. Observer Influence (Perturbation Study)
**Hypothesis:** External perturbation (canvas clicks) alters the macro-evolutionary trajectory of DNA parameters.  
**Protocol:**
- **Control condition:** Run the simulation passively. Track time spent in `Calm` vs `Collapse` phases.
- **Test condition:** Aggressively perturb the system via rapid canvas clicks. Each click injects one node, increments `tension += 0.3`, and increments `noise_level += 0.1`.
- **Observe:**
  - Does `recovery_rate` exhibit a permanent upward mutation following sustained perturbation?
  - Does elevated `noise_level` shorten subsequent `Calm` phase durations?

## 3. Phase Asymmetry
**Hypothesis:** Phase duration is not symmetric — `Collapse` acts as a short, high-amplitude correction while `Calm` and `Growth` act as longer accumulation phases.  
**Protocol:**
- Monitor the `Macro Phase` indicator over time.
- Record transition timestamps and phase durations from the Phase Dominance HUD.
- Verify whether `Collapse` consistently produces short, high-amplitude events while `Calm`/`Growth` produce longer, gradual accumulation patterns.

## 4. Memory Saturation (Limit Behavior)
**Hypothesis:** High `memory_weight` values and dense GhostTrace populations cause system stalls or emergent deadlock (Temporal Freeze).  
**Protocol:**
- Wait for, or artificially induce, a state where `memory_weight` exceeds 0.80.
- **Observe:**
  - Does GhostTrace density cause cluster consolidation to stall (Temporal Freeze)?
  - Does the system enter prolonged Tension loops when ghost-to-node phase influence dominates present-node synchronization?
  - Does a collapse event eventually resolve the deadlock, or does the system require external perturbation?

## 5. Rare Event Clustering (Emergent Causality)
**Hypothesis:** Rare events (`Hyper-Sync`, `Fragmentation Spasm`, `Memory Flood`) may not be observationally uniform if the underlying DNA trajectory correlates with their preconditions.  
**Protocol:**
- Record the system state (DNA values, tension, active phase) at the moment each rare event triggers.
- **Observe:**
  - Do `Memory Flood` events cluster during high-`drift`, high-`memory_weight` periods?
  - Does a `Hyper-Sync` event (`coherence_bias` forced to 1.0, all node phases aligned) reliably produce a subsequent `Collapse` phase?
  - If event timing correlates with DNA state, the trigger probability is effectively conditioned on the parameter trajectory — an emergent causal coupling.
