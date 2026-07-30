import { Stats } from '../engine/Core';

export async function generateReflection(prompt: string): Promise<string> {
  try {
    const res = await fetch('/api/gemini/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data.text || "";
  } catch (error) {
    console.error("Gemini Reflection Error:", error);
    return "";
  }
}

export async function generateDreamReflection(stats: Stats): Promise<string> {
  try {
    const latestFossil = stats.fossilRecord && stats.fossilRecord.length > 0 
      ? stats.fossilRecord[stats.fossilRecord.length - 1]
      : null;

    const ghostFragments = stats.ghosts
      ? stats.ghosts.filter(g => g.fragment).map(g => g.fragment).slice(0, 6)
      : [];

    const res = await fetch('/api/gemini/dream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: stats.phase,
        fossilCount: stats.fossilRecord?.length || 0,
        latestFossil,
        dna: stats.dna,
        ghostFragments,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data.text || "";
  } catch (error) {
    console.error("Gemini Dream Error:", error);
    return "";
  }
}

