const PLAYHQ_GRAPHQL_URL = 'https://api.playhq.com/graphql'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Content-Type': 'application/json',
  Origin: 'https://www.playhq.com',
  Referer: 'https://www.playhq.com/',
  tenant: 'afl',
}

const PREVIEW_QUERY = `
query gameView($gameId: ID!) {
  discoverGame(gameID: $gameId) {
    id date
    home { ... on DiscoverTeam { name } }
    away { ... on DiscoverTeam { name } }
    allocation { court { venue { name } } }
    round { grade { season { competition { name } } } }
  }
}
`

export async function fetchMatchPreview(matchId: string) {
  try {
    const res = await fetch(PLAYHQ_GRAPHQL_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ operationName: 'gameView', variables: { gameId: matchId }, query: PREVIEW_QUERY }),
    })
    const data = await res.json()
    if (data.errors || !data.data) return null
    const game = data.data.discoverGame
    return {
      home_team: game.home.name,
      away_team: game.away.name,
      date: game.date,
      venue: game.allocation.court.venue.name,
      competition: game.round.grade.season.competition.name,
    }
  } catch {
    return null
  }
}
