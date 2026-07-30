import { Stats } from '../engine/Core';

export interface MindStateSnapshot {
  system: string;
  version: string;
  exportedAt: string;
  timestamp: number;
  macroPhase: string;
  systemDNA: {
    coherence: number;
    chaos: number;
    memoryWeight: number;
    drift: number;
  };
  phaseDominance: Record<string, number>;
  neuralTopology: {
    nodeCount: number;
    ghostCount: number;
    averageSyncStrength: number;
    activeClusters: Array<{
      id: string;
      size: number;
      resonance: number;
    }>;
    markers: Array<{
      type: string;
      label: string;
      intensity: number;
    }>;
  };
  diagnostics: {
    redFlags: string[];
    lowestIntegrityObserved: number;
    pruneCountTotal: number;
    collapseCount: number;
    collapseRecoveryCount: number;
    dormantNodesAdded: number;
    dormantNodesActivated: number;
  };
  fossilRecord: Stats['fossilRecord'];
  anomalySnapshots: Stats['anomalySnapshots'];
}

export function exportMindStateJSON(stats: Stats): void {
  const snapshot: MindStateSnapshot = {
    system: 'LUMINA_EMERGENT_MIND_STATE',
    version: 'v2.5',
    exportedAt: new Date().toISOString(),
    timestamp: Date.now(),
    macroPhase: stats.phase,
    systemDNA: {
      coherence: Number(stats.dna.coherence_bias.toFixed(4)),
      chaos: Number(stats.dna.noise_level.toFixed(4)),
      memoryWeight: Number(stats.dna.memory_weight.toFixed(4)),
      drift: Number(stats.dna.drift.toFixed(4)),
    },
    phaseDominance: stats.phaseDominance,
    neuralTopology: {
      nodeCount: stats.nodeCount,
      ghostCount: stats.ghostCount,
      averageSyncStrength: Number(stats.avgStrength.toFixed(4)),
      activeClusters: stats.clusters.map(c => ({
        id: c.id,
        size: c.size,
        resonance: Number(c.resonance.toFixed(4)),
      })),
      markers: stats.markers.map(m => ({
        type: m.type,
        label: m.label,
        intensity: Number(m.intensity.toFixed(4)),
      })),
    },
    diagnostics: {
      redFlags: stats.redFlags,
      lowestIntegrityObserved: stats.audit.lowest_integrity_observed,
      pruneCountTotal: stats.audit.prune_count_total,
      collapseCount: stats.audit.collapse_count,
      collapseRecoveryCount: stats.audit.collapse_recovery_count,
      dormantNodesAdded: stats.audit.dormant_nodes_added,
      dormantNodesActivated: stats.audit.dormant_nodes_activated,
    },
    fossilRecord: stats.fossilRecord,
    anomalySnapshots: stats.anomalySnapshots,
  };

  const jsonString = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `lumina_fossil_record_${stats.phase.toLowerCase()}_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
