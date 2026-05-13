// lib/detectCompetition.ts
// Auto-detects competition and grade from PlayHQ team names and competition name

export interface CompetitionDetection {
  competition: string
  amateurGrade?: string
  sanflGrade?: string
}

export function detectCompetition(
  playhqCompetition: string,
  homeTeam: string,
  awayTeam: string,
): CompetitionDetection {
  const comp  = playhqCompetition.toUpperCase()
  const home  = homeTeam.toUpperCase()
  const away  = awayTeam.toUpperCase()
  const teams = `${home} ${away}`

  // ── SANFLW — check before SANFL ───────────────────────────────────────────────
  if (teams.includes('SANFLW') || comp.includes('SANFLW')) {
    return { competition: 'SANFLW' }
  }

  // ── SANFL ─────────────────────────────────────────────────────────────────────
  if (comp.includes('SANFL')) {
    if (teams.includes('UNDER 16') || teams.includes('U16') || teams.includes('16S')) {
      return { competition: 'SANFL', sanflGrade: 'under-16' }
    }
    if (teams.includes('UNDER 18') || teams.includes('U18') || teams.includes('18S')) {
      return { competition: 'SANFL', sanflGrade: 'under-18' }
    }
    return { competition: 'SANFL', sanflGrade: 'league' }
  }

  // ── Adelaide Footy League (Men's + Women's) ───────────────────────────────────
  if (comp.includes('ADELAIDE FOOTY LEAGUE') || comp.includes('AFL ')) {

    // ── SAWFL Women's — W suffixes (check before M suffixes) ─────────────────
    if (teams.match(/\bW1R\b/)) return { competition: "SAWFL Women's", amateurGrade: 'division-1-reserves' }
    if (teams.match(/\bW2R\b/)) return { competition: "SAWFL Women's", amateurGrade: 'division-2-reserves' }
    if (teams.match(/\bW1\b/))  return { competition: "SAWFL Women's", amateurGrade: 'division-1' }
    if (teams.match(/\bW2\b/))  return { competition: "SAWFL Women's", amateurGrade: 'division-2' }
    if (teams.match(/\bW3\b/))  return { competition: "SAWFL Women's", amateurGrade: 'division-3' }
    if (teams.match(/\bW4\b/))  return { competition: "SAWFL Women's", amateurGrade: 'division-4' }
    if (teams.match(/\bW5\b/))  return { competition: "SAWFL Women's", amateurGrade: 'division-5' }
    if (teams.match(/\bW6\b/))  return { competition: "SAWFL Women's", amateurGrade: 'division-6' }

    // ── Amateur (Men's) — Reserves first (M1R before M1) ─────────────────────
    if (teams.match(/\bM1R\b/)) return { competition: 'Amateur', amateurGrade: 'division-1-reserves' }
    if (teams.match(/\bM2R\b/)) return { competition: 'Amateur', amateurGrade: 'division-2-reserves' }
    if (teams.match(/\bM3R\b/)) return { competition: 'Amateur', amateurGrade: 'division-3-reserves' }
    if (teams.match(/\bM4R\b/)) return { competition: 'Amateur', amateurGrade: 'division-4-reserves' }
    if (teams.match(/\bM5R\b/)) return { competition: 'Amateur', amateurGrade: 'division-5-reserves' }
    if (teams.match(/\bM6R\b/)) return { competition: 'Amateur', amateurGrade: 'division-6-reserves' }
    if (teams.match(/\bM7R\b/)) return { competition: 'Amateur', amateurGrade: 'division-7-reserves' }

    // ── Amateur (Men's) — League divisions ───────────────────────────────────
    if (teams.match(/\bM1\b/))  return { competition: 'Amateur', amateurGrade: 'division-1' }
    if (teams.match(/\bM2\b/))  return { competition: 'Amateur', amateurGrade: 'division-2' }
    if (teams.match(/\bM3\b/))  return { competition: 'Amateur', amateurGrade: 'division-3' }
    if (teams.match(/\bM4\b/))  return { competition: 'Amateur', amateurGrade: 'division-4' }
    if (teams.match(/\bM5\b/))  return { competition: 'Amateur', amateurGrade: 'division-5' }
    if (teams.match(/\bM6\b/))  return { competition: 'Amateur', amateurGrade: 'division-6' }
    if (teams.match(/\bM7\b/))  return { competition: 'Amateur', amateurGrade: 'division-7' }

    // ── C-Grade ───────────────────────────────────────────────────────────────
    if (teams.match(/\bC1\b/))  return { competition: 'Amateur', amateurGrade: 'division-c1' }
    if (teams.match(/\bC2\b/))  return { competition: 'Amateur', amateurGrade: 'division-c2' }
    if (teams.match(/\bC3\b/))  return { competition: 'Amateur', amateurGrade: 'division-c3' }
    if (teams.match(/\bC4\b/))  return { competition: 'Amateur', amateurGrade: 'division-c4' }
    if (teams.match(/\bC5\b/))  return { competition: 'Amateur', amateurGrade: 'division-c5' }
    if (teams.match(/\bC6\b/))  return { competition: 'Amateur', amateurGrade: 'division-c6' }
    if (teams.match(/\bC7\b/))  return { competition: 'Amateur', amateurGrade: 'division-c7' }
    if (teams.match(/\bC8\b/))  return { competition: 'Amateur', amateurGrade: 'division-c8' }

    // Fallback — Amateur unknown grade
    return { competition: 'Amateur' }
  }

  // ── Country Football ──────────────────────────────────────────────────────────
  return { competition: 'Country Football' }
}