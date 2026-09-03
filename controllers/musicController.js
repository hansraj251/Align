const youtubeMusicService =
    require("../services/youtubeMusicService");

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
