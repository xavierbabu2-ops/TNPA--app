/**
 * Executive Photo Resolution & Management Utilities
 * TNPA - Tamil Nadu Painters & Artists Welfare Association
 * 
 * Mandate: No icons or cartoon SVGs allowed for any executive.
 * Every state, district, zonal, and union executive must have an authentic photograph.
 */

export const DEFAULT_EXECUTIVE_PORTRAITS: string[] = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400", // 0: State President style (mature, dignified)
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400", // 1: General Secretary style (crisp executive)
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400", // 2: Treasurer style (professional)
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400", // 3: Vice President style
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400", // 4: Joint Secretary style
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400", // 5: Youth Wing Leader style
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=400&h=400", // 6: Legal Advisor style
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400&h=400", // 7: District Leader 1
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400", // 8: District Leader 2
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=400", // 9: District Leader 3
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400", // 10: Executive Officer
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400&h=400", // 11: Zonal Coordinator
];

/**
 * Returns a real portrait photograph URL for an executive.
 * Replaces cartoon SVGs and missing avatars with authentic dignified portrait photography.
 */
export function getExecutivePhoto(exec?: { id?: string; name?: string; role?: string; photoUrl?: string }): string {
  if (!exec) return DEFAULT_EXECUTIVE_PORTRAITS[0];

  // If user/admin uploaded a custom photo (Base64 data:image or valid non-svg image URL), respect it!
  if (
    exec.photoUrl &&
    !exec.photoUrl.endsWith(".svg") &&
    !exec.photoUrl.includes("_alvin.svg") &&
    !exec.photoUrl.includes("_babu.svg") &&
    !exec.photoUrl.includes("_sakthivel.svg")
  ) {
    return exec.photoUrl;
  }

  const n = (exec.name || "").toLowerCase();
  const r = (exec.role || "").toLowerCase();
  const id = exec.id || "";

  // 1. State President - S. Michael Alvin
  if (n.includes("மைக்கேல்") || n.includes("alvin") || r.includes("மாநில தலைவர்") || id === "exec_st_1" || id === "l1") {
    return DEFAULT_EXECUTIVE_PORTRAITS[0];
  }

  // 2. State General Secretary - R. Xavier Babu
  if (n.includes("சேவியர்") || n.includes("xavier") || r.includes("பொதுச்செயலாளர்") || id === "exec_st_2" || id === "l2") {
    return DEFAULT_EXECUTIVE_PORTRAITS[1];
  }

  // 3. State Treasurer - R. Sakthivel
  if (n.includes("சக்திவேல்") || n.includes("sakthivel") || r.includes("பொருளாளர்") || id === "exec_st_3") {
    return DEFAULT_EXECUTIVE_PORTRAITS[2];
  }

  // 4. State Vice President - K. Muthukumar
  if (n.includes("முத்துக்குமார்") || n.includes("muthukumar") || r.includes("துணைத் தலைவர்") || id === "exec_st_4") {
    return DEFAULT_EXECUTIVE_PORTRAITS[3];
  }

  // 5. State Joint Secretary - M. Anthoniraj
  if (n.includes("அந்தோணிராஜ்") || n.includes("anthoniraj") || r.includes("இணைச் செயலாளர்") || id === "exec_st_5") {
    return DEFAULT_EXECUTIVE_PORTRAITS[4];
  }

  // 6. State Youth Wing President - V. Dinesh
  if (n.includes("தினேஷ்") || n.includes("dinesh") || r.includes("இளைஞரணி") || id === "exec_st_6") {
    return DEFAULT_EXECUTIVE_PORTRAITS[5];
  }

  // 7. State Legal Advisor - Adv. S. Ravichandran
  if (n.includes("ரவிச்சந்திரன்") || n.includes("ravichandran") || r.includes("சட்ட") || id === "exec_st_7") {
    return DEFAULT_EXECUTIVE_PORTRAITS[6];
  }

  // Consistent deterministic photo assignment for all 38 District & Zonal executives
  let hash = 0;
  const seed = id + (exec.name || "") + (exec.role || "");
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_EXECUTIVE_PORTRAITS.length;
  return DEFAULT_EXECUTIVE_PORTRAITS[index];
}
