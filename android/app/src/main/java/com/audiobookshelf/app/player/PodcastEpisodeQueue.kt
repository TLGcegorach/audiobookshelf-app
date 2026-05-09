package com.audiobookshelf.app.player

import com.audiobookshelf.app.data.MediaProgress
import com.audiobookshelf.app.data.Podcast
import com.audiobookshelf.app.data.PodcastEpisode

object PodcastEpisodeQueue {
  fun getNextQueuedEpisode(
          currentEpisodeId: String?,
          episodeQueue: List<String>,
          podcast: Podcast,
          libraryItemId: String,
          mediaProgress: List<MediaProgress>,
          localPlayback: Boolean
  ): PodcastEpisode? {
    if (currentEpisodeId.isNullOrEmpty()) return null

    return episodeQueue
            .dropWhile { it != currentEpisodeId }
            .drop(1)
            .mapNotNull { queuedEpisodeId ->
              podcast.episodes?.find {
                it.id == queuedEpisodeId || (localPlayback && it.serverEpisodeId == queuedEpisodeId)
              }
            }
            .firstOrNull { queuedEpisode ->
              val serverEpisodeId = queuedEpisode.serverEpisodeId ?: queuedEpisode.id
              val progress =
                      mediaProgress.find {
                        it.libraryItemId == libraryItemId && it.episodeId == serverEpisodeId
                      }
              progress == null || !progress.isFinished
            }
  }
}
