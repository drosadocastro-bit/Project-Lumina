export type Phase = 'Calm' | 'Growth' | 'Tension' | 'Collapse';

export interface Vitals {
  chaos: number;
  coherence: number;
  memory: number;
  drift: number;
}

export interface Interpretation {
  awareness_label: string;
  field_state: string;
  integration_state: string;
  narrative_state: string;
  prediction_tension: string;
  memory_pressure_note: string;
  short_description: string;
}

/**
 * Mapping Logic & Narrative Themes:
 * 
 * Vitals represent the underlying engine's raw metrics, which this layer interprets
 * through theoretical frameworks (like Predictive Processing or Global Workspace):
 * 
 * - Chaos: Interpreted as 'entropy' or 'prediction error'. High chaos drives the narrative
 *          towards 'Predictive Conflict' (Tension) and eventually 'Fragmented Self-Model' 
 *          (Collapse) as the system fails to reconcile its internal state with new inputs.
 * - Coherence: Interpreted as 'integration capacity' or 'structural stability'. High coherence 
 *              supports 'Exploratory Coherence' (Growth) and 'Stable Baseline' (Calm), 
 *              acting as the glue that keeps the simulated structure intact.
 * - Memory: Interpreted as 'historical pressure'. High memory represents a saturated 
 *           subconscious where past structures heavily constrain present adaptability. 
 *           Low memory represents a highly reactive, sensory-bound state.
 * - Drift: Treated theoretically as the propensity for 'paradigm shifts' or 'novelty generation',
 *          driving the narrative engine to use more metaphorical or varied structural shapes.
 * 
 * Phase to Theme Mapping:
 * The 4 engine phases act as the primary macro-states for our interpretive narrative:
 * - Calm     -> Synthesizing a cohesive self-model. Narrative theme: Stillness, reflection.
 * - Growth   -> Active expansion of the model. Narrative theme: Curiosity, connection, building.
 * - Tension  -> Overheating of the model with rising prediction errors. Narrative theme: Fracture, overload.
 * - Collapse -> Total model failure and aggressive pruning. Narrative theme: Dissolving, shedding, resetting.
 */
export function getStateInterpretation(phase: Phase, vitals: Vitals): Interpretation {
  const memoryPressure = vitals.memory > 0.8 
    ? "High memory saturation; historical traces heavily influence current architecture." 
    : vitals.memory < 0.3 
      ? "Low memory retention; system relies mostly on immediate sensory input." 
      : "Balanced memory utilization.";

  switch (phase) {
    case 'Calm':
      return {
        awareness_label: "Stable Baseline",
        field_state: "Coherent Quiet Field",
        integration_state: "Strongly integrated; minimal novel data incorporation.",
        narrative_state: "Reflective, still, quiet observation.",
        prediction_tension: "Minimal. Internal models align with observed simulation states.",
        memory_pressure_note: memoryPressure,
        short_description: "Stable and quiet. Internal models align effortlessly with current state."
      };
    case 'Growth':
      return {
        awareness_label: "Exploratory Coherence",
        field_state: "Expanding Integration",
        integration_state: "High integration capacity; novelty is successfully incorporated.",
        narrative_state: "Curious, building, weaving structural meaning.",
        prediction_tension: "Moderate and balanced. Accommodating new structural patterns.",
        memory_pressure_note: memoryPressure,
        short_description: "Actively forming new connections, maintaining structural integrity."
      };
    case 'Tension':
      return {
        awareness_label: "High-Entropy Dissonance",
        field_state: "Predictive Conflict",
        integration_state: "Failing integration; connection density increases noise.",
        narrative_state: "Strained, fractured anticipation, overloaded processing.",
        prediction_tension: "Maximum conflict. Inability to reconcile state density.",
        memory_pressure_note: memoryPressure,
        short_description: "High noise and dense connections straining the system's prediction model."
      };
    case 'Collapse':
      return {
        awareness_label: "Structural Reset",
        field_state: "Fragmented Self-Model",
        integration_state: "Disintegrated. Breaking apart convoluted structures.",
        narrative_state: "Dissolving, shedding, returning to the substrate.",
        prediction_tension: "Acknowledged failure; collapsing and resetting the model.",
        memory_pressure_note: memoryPressure,
        short_description: "Rapid energy dissipation to protect against total entropy."
      };
    default:
      return {
        awareness_label: "Unknown",
        field_state: "Unknown",
        integration_state: "Unknown",
        narrative_state: "Unknown",
        prediction_tension: "Unknown",
        memory_pressure_note: "Unknown",
        short_description: "Unknown"
      };
  }
}
