const youtubeMusicService =
    require("../services/youtubeMusicService");
const db =
    require("../db");
exports.search =
    async (req, res) => {

        try {

            const query =
                String(
                    req.query.q || ""
                ).trim();

            const maxResults =
                Number(
                    req.query.limit || 12
                );

            const pageToken =
                String(
                    req.query.pageToken || ""
                ).trim();

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Search query is required."
                });
            }

            const result =
                await youtubeMusicService.searchMusic({
                    query,
                    maxResults,
                    pageToken
                });
            

            return res.json({
                success: true,
                ...result
            });

        }
        catch (error) {

            console.error(
                "Music search error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to search music."
            });
        }
    };
exports.save =
    async (req, res) => {
        try {
            const videoId =
                String(
                    req.body.videoId || ""
                ).trim();

            const title =
                String(
                    req.body.title || ""
                ).trim();

            if (!videoId || !title) {
                return res.status(400).json({
                    success: false,
                    message:
                        "videoId and title are required."
                });
            }
                        let duration =
                req.body.duration || null;

            if (!duration) {
                duration =
                    await youtubeMusicService.getVideoDuration(
                        videoId
                    );
            }

            await db.runAsync(
                `
                INSERT INTO music_songs (
                    youtube_video_id,
                    title,
                    artist,
                    channel_title,
                    thumbnail_url,
                    duration
                )
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(youtube_video_id)
                DO UPDATE SET
                    title = excluded.title,
                    artist = excluded.artist,
                    channel_title = excluded.channel_title,
                    thumbnail_url = excluded.thumbnail_url,
                    duration = excluded.duration,
                    updated_at = CURRENT_TIMESTAMP
                `,
                [
                    videoId,
                    title,
                    req.body.artist ||
                    req.body.channelTitle ||
                                            null,
                    req.body.channelTitle || null,
                    req.body.thumbnailUrl || null,
                    duration || null
                ]
            );

            return res.json({
                success: true
            });
        }
        catch (error) {
            console.error(
                "Music save error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to save music."
            });
        }
    };