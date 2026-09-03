const YOUTUBE_API_BASE =
    "https://www.googleapis.com/youtube/v3";

const getYouTubeApiKey = () => {
    const apiKey =
        process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "YOUTUBE_API_KEY is not configured."
        );
    }

    return apiKey;
};

const searchMusic = async ({
    query,
    maxResults = 12,
    pageToken = ""
}) => {

    const cleanQuery =
        String(query || "").trim();

    if (!cleanQuery) {
        throw new Error(
            "Search query is required."
        );
    }

    const params =
        new URLSearchParams({
            part: "snippet",
            q: cleanQuery,
            type: "video",
            maxResults: String(
                Math.min(
                    Math.max(
                        Number(maxResults) || 12,
                        1
                    ),
                    50
                )
            ),
            regionCode: "IN",
            relevanceLanguage: "en",
            videoEmbeddable: "true",
            key: getYouTubeApiKey()
        });

    if (pageToken) {
        params.set(
            "pageToken",
            String(pageToken)
        );
    }

    const response =
        await fetch(
            `${YOUTUBE_API_BASE}/search?${params.toString()}`
        );

    let data = {};

    try {
        data = await response.json();
    }
    catch {
        throw new Error(
            "Invalid response from YouTube API."
        );
    }

    if (!response.ok) {
        console.error(
            "YouTube API error:",
            data
        );

        throw new Error(
            data?.error?.message ||
            "Unable to search YouTube."
        );
    }

    const items =
        Array.isArray(data.items)
            ? data.items
            : [];
    const videoIds =
    items
        .map(item => item?.id?.videoId)
        .filter(Boolean);

let durationMap = {};

if (videoIds.length) {
    const durationParams =
        new URLSearchParams({
            part: "contentDetails",
            id: videoIds.join(","),
            key: getYouTubeApiKey()
        });

    const durationResponse =
        await fetch(
            `${YOUTUBE_API_BASE}/videos?${durationParams.toString()}`
        );

    let durationData = {};

    try {
        durationData =
            await durationResponse.json();
    }
    catch {
        durationData = {};
    }

    if (durationResponse.ok) {
        durationMap =
            Object.fromEntries(
                (durationData.items || []).map(video => [
                    video.id,
                    video?.contentDetails?.duration || null
                ])
            );
    }
}
const filteredItems =
    items.filter(item => {
        const duration =
            durationMap[item?.id?.videoId];

        if (!duration) {
            return true;
        }

        return !/^PT([0-5]?[0-9]S|[0-5]?[0-9]M)$/.test(duration);
    });        

    return {
        items: filteredItems.map(item => ({
            videoId:
                item?.id?.videoId || null,

            title:
                item?.snippet?.title || "",

            description:
                item?.snippet?.description || "",

            channelTitle:
                item?.snippet?.channelTitle || "",

            publishedAt:
                item?.snippet?.publishedAt || null,

            thumbnails: {
                default:
                    item?.snippet?.thumbnails?.default?.url ||
                    null,

                medium:
                    item?.snippet?.thumbnails?.medium?.url ||
                    null,

                high:
                    item?.snippet?.thumbnails?.high?.url ||
                    null
            }
        })),

        nextPageToken:
            data.nextPageToken || null,

        prevPageToken:
            data.prevPageToken || null,

        totalResults:
            data?.pageInfo?.totalResults || 0
    };
};

module.exports = {
    searchMusic
};
