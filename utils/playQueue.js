/**
 * Helpers for building the client play queue.
 *
 * A queue is an ordered array of `play-item` payloads that the AudioPlayerContainer
 * plays one after another when the current item ends.
 */

/**
 * Sort podcast episodes oldest -> newest.
 * Episodes without a published date are treated as the oldest, ties fall back to episode index.
 *
 * @param {Object[]} episodes
 * @returns {Object[]} new sorted array
 */
export function sortEpisodesChronologically(episodes) {
  return [...(episodes || [])].sort((a, b) => {
    const aPub = Number(a.publishedAt) || 0
    const bPub = Number(b.publishedAt) || 0
    if (aPub !== bPub) return aPub - bPub
    return (Number(a.index) || 0) - (Number(b.index) || 0)
  })
}

/**
 * Build the play-item payload for a podcast episode
 *
 * @param {Object} params
 * @param {Object} params.episode episode (server episode, or local episode when isLocal)
 * @param {string} params.libraryItemId library item id the episodes belong to (local id when isLocal)
 * @param {string} [params.localLibraryItemId] local library item id when a server item is also downloaded
 * @param {Object} [params.localEpisodeMap] map of server episode id -> local episode
 * @param {boolean} [params.isLocal] episodes and libraryItemId are local
 * @returns {Object} play-item payload
 */
export function getEpisodePlayPayload({ episode, libraryItemId, localLibraryItemId, localEpisodeMap, isLocal }) {
  if (isLocal) {
    return { libraryItemId, episodeId: episode.id }
  }
  const localEpisode = localEpisodeMap?.[episode.id]
  if (localEpisode && localLibraryItemId) {
    return { libraryItemId: localLibraryItemId, episodeId: localEpisode.id, serverLibraryItemId: libraryItemId, serverEpisodeId: episode.id }
  }
  return { libraryItemId, episodeId: episode.id }
}

/**
 * Build the queue of episodes to play after `startEpisodeId`.
 * Episodes are played in chronological order (oldest -> newest) and finished episodes are skipped.
 *
 * @param {Object} params same as getEpisodePlayPayload plus:
 * @param {Object[]} params.episodes all episodes of the podcast
 * @param {string} params.startEpisodeId id of the episode being started (same id space as episodes)
 * @param {Function} params.isFinished (episode) => boolean
 * @returns {Object[]} play-item payloads
 */
export function buildPodcastEpisodeQueue({ episodes, startEpisodeId, isFinished, ...payloadParams }) {
  const sorted = sortEpisodesChronologically(episodes)
  const startIndex = sorted.findIndex((ep) => ep.id === startEpisodeId)
  if (startIndex < 0) return []
  return sorted
    .slice(startIndex + 1)
    .filter((ep) => !isFinished(ep))
    .map((episode) => getEpisodePlayPayload({ episode, ...payloadParams }))
}
