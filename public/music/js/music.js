(() => {
    "use strict";

    /* =========================================================
       CONFIG
    ========================================================= */

    const API_BASE = "/api/music/search";

    const STORAGE_KEYS = {
        favorites: "alignMusicFavorites",
        recent: "alignMusicRecent",
        volume: "alignMusicVolume",
        playback: "alignMusicPlayback"
    };

    const MAX_RECENT = 20;


    /* =========================================================
       DOM
    ========================================================= */

    const searchForm =
        document.getElementById(
            "musicSearchForm"
        );

    const searchInput =
        document.getElementById(
            "musicSearchInput"
        );

    const searchButton =
        document.getElementById(
            "musicSearchButton"
        );

    const clearButton =
        document.getElementById(
            "musicClearButton"
        );
        

    const resultsContainer =
        document.getElementById(
            "musicResults"
        );

    const resultsInfo =
        document.getElementById(
            "musicResultsInfo"
        );

    const loading =
        document.getElementById(
            "musicLoading"
        );

    const emptyState =
        document.getElementById(
            "musicEmpty"
        );

    const pagination =
        document.getElementById(
            "musicPagination"
        );

    const previousButton =
        document.getElementById(
            "musicPreviousButton"
        );

    const nextButton =
        document.getElementById(
            "musicNextButton"
        );

    const favoritesContainer =
        document.getElementById(
            "musicFavorites"
        );

    const recentContainer =
        document.getElementById(
            "musicRecent"
        );

    const playerTitle =
        document.getElementById(
            "musicPlayerTitle"
        );

    const playerArtist =
        document.getElementById(
            "musicPlayerArtist"
        );

    const playerArtwork =
        document.getElementById(
            "musicPlayerArtwork"
        );

    const playPauseButton =
        document.getElementById(
            "musicPlayPause"
        );

    const playerPreviousButton =
        document.getElementById(
            "musicPrevious"
        );

    const playerNextButton =
        document.getElementById(
            "musicNext"
        );

    const musicPlayer =
        document.getElementById(
            "musicPlayer"
        );

    const musicPlayerClose =
        document.getElementById(
            "musicPlayerClose"
        );

    const progress =
        document.getElementById(
            "musicProgress"
        );

    const currentTime =
        document.getElementById(
            "musicCurrentTime"
        );

    const duration =
        document.getElementById(
            "musicDuration"
        );

    const volume =
        document.getElementById(
            "musicVolume"
        );

    const toast =
        document.getElementById(
            "musicToast"
        );
    const resultsSection =
    document.getElementById("musicResultsSection");    


    /* =========================================================
       STATE
    ========================================================= */

    let results = [];

    let currentIndex = -1;

    let currentSong = null;
    let activePlaybackList = [];
    let activePlaybackIndex = -1;
    let nextPageToken = null;

    let previousPageToken = null;

    let lastSearchQuery = "";

    let player = null;

    let playerReady = false;

    let playerState = -1;

    let progressTimer = null;

    let toastTimer = null;

    let lastPlaybackSaveAt = 0;

    let favorites =
        loadStorage(
            STORAGE_KEYS.favorites,
            []
        );

    let recent =
        loadStorage(
            STORAGE_KEYS.recent,
            []
        );


    /* =========================================================
       STORAGE
    ========================================================= */

    function loadStorage(
        key,
        fallback
    ) {
        try {

            const value =
                localStorage.getItem(key);

            if (!value) {
                return fallback;
            }

            const parsed =
                JSON.parse(value);

            return parsed ?? fallback;

        }
        catch (error) {

            console.warn(
                `Unable to read ${key}`,
                error
            );

            return fallback;
        }
    }


    function saveStorage(
        key,
        value
    ) {
        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

        }
        catch (error) {

            console.warn(
                `Unable to save ${key}`,
                error
            );
        }
    }


    /* =========================================================
       PLAYBACK PERSISTENCE / SPA VIEW
    ========================================================= */

    function savePlaybackState(force = false) {

        if (!currentSong?.videoId) {
            return;
        }

        const now = Date.now();

        if (!force && now - lastPlaybackSaveAt < 1800) {
            return;
        }

        let currentTime = 0;

        try {
            if (playerReady && player) {
                currentTime =
                    Number(
                        player.getCurrentTime()
                    ) || 0;
            }
        }
        catch {
            currentTime = 0;
        }

        try {
            localStorage.setItem(
                STORAGE_KEYS.playback,
                JSON.stringify({
                    song: currentSong,
                    currentTime,
                    isPlaying:
                        playerState ===
                        YT.PlayerState.PLAYING,
                    savedAt: now
                })
            );

            lastPlaybackSaveAt = now;
        }
        catch (error) {
            console.warn(
                "Unable to save playback state",
                error
            );
        }
    }


    function loadPlaybackState() {

        try {
            const raw =
                localStorage.getItem(
                    STORAGE_KEYS.playback
                );

            if (!raw) {
                return null;
            }

            const saved = JSON.parse(raw);

            if (!saved?.song?.videoId) {
                return null;
            }

            return saved;
        }
        catch {
            return null;
        }
    }


    function expandMusicPlayer() {

        if (!musicPlayer || !currentSong) {
            return;
        }

        musicPlayer.classList.add(
            "is-expanded"
        );

        if (musicPlayerClose) {
            musicPlayerClose.classList.remove(
                "hidden"
            );
        }

        if (location.hash !== "#player") {
            history.pushState(
                { musicPlayer: true },
                "",
                "#player"
            );
        }
    }


    function collapseMusicPlayer(restoreHistory = true) {

        if (!musicPlayer) {
            return;
        }

        musicPlayer.classList.remove(
            "is-expanded"
        );

        if (musicPlayerClose) {
            musicPlayerClose.classList.add(
                "hidden"
            );
        }

        if (restoreHistory && location.hash === "#player") {
            history.back();
        }
    }


    function restorePlaybackState() {

        const saved =
            loadPlaybackState();

        if (!saved?.song?.videoId || !playerReady || !player) {
            return;
        }

        currentSong =
            normalizeSong(
                saved.song
            );

        currentIndex = -1;

        updatePlayerUI();
        renderRecent();

        const startSeconds =
            Math.max(
                0,
                Number(saved.currentTime) || 0
            );

        try {
            player.loadVideoById({
                videoId: currentSong.videoId,
                startSeconds
            });

            if (location.hash === "#player") {
                expandMusicPlayer();
            }

        }
        catch (error) {
            console.error(
                "Unable to restore playback:",
                error
            );
        }
    }


    window.addEventListener(
        "beforeunload",
        () => savePlaybackState(true)
    );

    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.visibilityState === "hidden") {
                savePlaybackState(true);
            }
        }
    );


        /* =========================================================
       HELPERS
    ========================================================= */

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }


    function formatTime(
        seconds
    ) {

        const value =
            Math.max(
                0,
                Math.floor(
                    Number(seconds) || 0
                )
            );

        const minutes =
            Math.floor(
                value / 60
            );

        const remainingSeconds =
            value % 60;

        return `${minutes}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }


    function showToast(
        message
    ) {

        if (!toast) {
            return;
        }

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );

        clearTimeout(
            toastTimer
        );

        toastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2400);
    }


    function normalizeSong(
        song
    ) {

        return {
            videoId:
                song?.videoId ||
                null,

            title:
                song?.title ||
                "Unknown title",

            description:
                song?.description ||
                "",

            channelTitle:
                song?.channelTitle ||
                "YouTube",

            publishedAt:
                song?.publishedAt ||
                null,

            thumbnails: {
                default:
                    song?.thumbnails?.default ||
                    null,

                medium:
                    song?.thumbnails?.medium ||
                    null,

                high:
                    song?.thumbnails?.high ||
                    null
            }
        };
    }


    function getSongImage(
        song
    ) {

        return (
            song?.thumbnails?.high ||
            song?.thumbnails?.medium ||
            song?.thumbnails?.default ||
            ""
        );
    }


    function isFavorite(
        videoId
    ) {

        return favorites.some(
            song =>
                song.videoId === videoId
        );
    }


    /* =========================================================
       YOUTUBE PLAYER
    ========================================================= */

    window.onYouTubeIframeAPIReady =
        () => {

            createYouTubePlayer();

        };


    function createYouTubePlayer() {

        if (
            typeof YT === "undefined" ||
            !YT.Player
        ) {
            return;
        }

        if (player) {
            return;
        }

        player =
            new YT.Player(
                "youtubePlayer",
                {
                    width: "2",
                    height: "2",

                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        iv_load_policy: 3,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0
                    },

                    events: {

                        onReady:
                            handlePlayerReady,

                        onStateChange:
                            handlePlayerStateChange,

                        onError:
                            handlePlayerError
                    }
                }
            );
    }


    function handlePlayerReady(
        event
    ) {

        playerReady = true;

        const savedVolume =
            Number(
                localStorage.getItem(
                    STORAGE_KEYS.volume
                )
            );

        const initialVolume =
            Number.isFinite(
                savedVolume
            )
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        savedVolume
                    )
                )
                : 100;

        if (volume) {
            volume.value =
                String(
                    initialVolume
                );
        }

        event.target.setVolume(
            initialVolume
        );

        restorePlaybackState();
    }


    function handlePlayerStateChange(
        event
    ) {

        playerState =
            event.data;

        savePlaybackState(true);

        if (
            event.data ===
            YT.PlayerState.PLAYING
        ) {

            updatePlayButton(
                true
            );

            startProgressTimer();

        }
        else if (
            event.data ===
            YT.PlayerState.PAUSED
        ) {

            updatePlayButton(
                false
            );

            stopProgressTimer();

        }
        else if (
            event.data ===
            YT.PlayerState.ENDED
        ) {

            updatePlayButton(
                false
            );

            stopProgressTimer();

            if (window.AlignMusicExtras?.repeat && currentSong) {
    playSong(
        currentSong,
        activePlaybackIndex,
        activePlaybackList
    );
} else {
    playNext();
}

        }
        else {

            updatePlayButton(
                false
            );
        }
    }


    function handlePlayerError(
        event
    ) {console.error("YouTube Player Error:", event?.data);

        stopProgressTimer();

        updatePlayButton(
            false
        );

        const errorMessages = {
            2: "Invalid YouTube video.",
            5: "This video cannot be played.",
            100: "This video is unavailable.",
            101: "Playback is not allowed for this video.",
            150: "Playback is not allowed for this video."
        };

        showToast(
            errorMessages[event.data] ||
            "Unable to play this video."
        );
    }


    /* =========================================================
       SEARCH
    ========================================================= */

    async function searchMusic(
        query,
        pageToken = ""
    ) {

        const cleanQuery =
            String(
                query || ""
            ).trim();

        if (!cleanQuery) {
            showToast(
                "Enter a song or artist to search."
            );
            return;
        }

        setLoading(
            true
        );

        try {

            const params =
                new URLSearchParams({
                    q: cleanQuery,
                    limit: "12"
                });

            if (pageToken) {
                params.set(
                    "pageToken",
                    pageToken
                );
            }

            const response =
                await fetch(
                    `${API_BASE}?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );

            let data = {};

            try {

                data =
                    await response.json();

            }
            catch {

                throw new Error(
                    "Invalid server response."
                );
            }

            if (!response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to search music."
                );
            }

            results =
                Array.isArray(
                    data.items
                )
                    ? data.items
                        .map(
                            normalizeSong
                        )
                        .filter(
                            song =>
                                song.videoId
                        )
                    : [];

            nextPageToken =
                data.nextPageToken ||
                null;

            previousPageToken =
                data.prevPageToken ||
                null;

            lastSearchQuery =
                cleanQuery;
            if (resultsSection) {
    resultsSection.classList.remove("hidden");
}    

            renderResults();

            updatePagination();

            if (results.length) {

                resultsInfo.textContent =
                    `${results.length} results for "${cleanQuery}"`;

                emptyState.classList.add(
                    "hidden"
                );

                clearButton.classList.remove(
                    "hidden"
                );

            }
            else {

                resultsInfo.textContent =
                    `No results found for "${cleanQuery}"`;

                emptyState.classList.remove(
                    "hidden"
                );

                clearButton.classList.remove(
                    "hidden"
                );
            }

        }
        catch (error) {

            console.error(
                "Music search error:",
                error
            );

            results = [];

            nextPageToken = null;

            previousPageToken = null;

            resultsContainer.innerHTML = "";

            emptyState.classList.remove(
                "hidden"
            );

            resultsInfo.textContent =
                error.message ||
                "Unable to search music.";

            showToast(
                error.message ||
                "Unable to search music."
            );

        }
        finally {

            setLoading(
                false
            );
        }
    }


    function setLoading(
        state
    ) {

        if (!loading) {
            return;
        }

        loading.classList.toggle(
            "hidden",
            !state
        );

        if (state) {

            emptyState.classList.add(
                "hidden"
            );

            searchButton.disabled =
                true;

        }
        else {

            searchButton.disabled =
                false;
        }
    }


    /* =========================================================
       RENDER SEARCH RESULTS
    ========================================================= */

    function renderResults() {

        if (!resultsContainer) {
            return;
        }

        if (!results.length) {

            resultsContainer.innerHTML =
                "";

            return;
        }

        resultsContainer.innerHTML =
            results
                .map(
                    (
                        song,
                        index
                    ) =>
                        renderResultCard(
                            song,
                            index
                        )
                )
                .join("");
    }


    function renderResultCard(
        song,
        index
    ) {

        const image =
            getSongImage(
                song
            );

        const favorite =
            isFavorite(
                song.videoId
            );

        return `
            <article
                class="music-result-card"
                data-index="${index}">

                <div class="music-result-image-wrap">

                    ${
                        image
                            ? `
                                <img
                                    src="${escapeHtml(image)}"
                                    alt="${escapeHtml(song.title)}"
                                    class="music-result-image"
                                    loading="lazy">
                              `
                            : `
                                <div
                                    class="music-result-image"
                                    style="
                                        display:grid;
                                        place-items:center;
                                        color:#8b5cf6;
                                        font-size:32px;
                                    ">
                                    ♪
                                </div>
                              `
                    }

                    <button
                        type="button"
                        class="music-result-play"
                        data-action="play"
                        data-index="${index}"
                        aria-label="Play ${escapeHtml(song.title)}">

                        ▶

                    </button>

                </div>

                <div class="music-result-body">

                    <button
    type="button"
    class="music-result-title"
    data-action="play"
    data-index="${index}"
>
    ${escapeHtml(song.title)}
</button>

                    <div class="music-result-channel">
                        ${escapeHtml(song.channelTitle)}
                    </div>

                    <div class="music-result-actions">

                        <button
                            type="button"
                            class="music-result-action"
                            data-action="play"
                            data-index="${index}">

                            ▶ Play

                        </button>

                        <button
                            type="button"
                            class="music-result-action ${
                                favorite
                                    ? "favorite-active"
                                    : ""
                            }"
                            data-action="favorite"
                            data-index="${index}">

                            ${
                                favorite
                                    ? "♥ Saved"
                                    : "♡ Save"
                            }

                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    /* =========================================================
       PLAYBACK
    ========================================================= */

    function playSong(
    song,
    index = -1,
    playbackList = null
) {

        if (!song?.videoId) {
            return;
        }

        currentSong =
            normalizeSong(
                song
            );

        currentIndex =
            Number.isInteger(index)
                ? index
                : -1;
       if (Array.isArray(playbackList) && playbackList.length) {
    activePlaybackList = playbackList
        .filter(song => song?.videoId)
        .map(normalizeSong);

    activePlaybackIndex =
        Number.isInteger(index)
            ? index
            : 0;
} else {
    activePlaybackList = results;
    activePlaybackIndex = currentIndex;
}       

        try {
            localStorage.setItem(
                STORAGE_KEYS.playback,
                JSON.stringify({
                    song: currentSong,
                    currentTime: 0,
                    isPlaying: true,
                    savedAt: Date.now()
                })
            );
            lastPlaybackSaveAt = Date.now();
        }
        catch (error) {
            console.warn(
                "Unable to save playback state",
                error
            );
        }

        updatePlayerUI();
        

        addToRecent(
            currentSong
        );

        renderRecent();

        if (!playerReady || !player) {

            showToast(
                "Music player is still loading..."
            );

            return;
        }

        try {

            player.loadVideoById(
    currentSong.videoId
);

            updatePlayButton(
                true
            );

        }
        catch (error) {

            console.error(
                "Playback error:",
                error
            );

            showToast(
                "Unable to start playback."
            );
        }
    }


    function togglePlayPause() {

        if (!currentSong) {

            if (results.length) {

                playSong(
                    results[0],
                    0
                );

            }
            else {

                showToast(
                    "Search for a song first."
                );
            }

            return;
        }

        if (
            !playerReady ||
            !player
        ) {

            showToast(
                "Music player is still loading..."
            );

            return;
        }

        if (
            playerState ===
            YT.PlayerState.PLAYING
        ) {

            player.pauseVideo();

        }
        else {

            player.playVideo();

        }
    }


    function playPrevious() {

        if (!activePlaybackList.length) {
    return;
}

        if (activePlaybackIndex <= 0) {
    playSong(
        activePlaybackList[activePlaybackList.length - 1],
        activePlaybackList.length - 1,
        activePlaybackList
    );
    return;
}

        const index =
    activePlaybackIndex - 1;

playSong(
    activePlaybackList[index],
    index,
    activePlaybackList
);
    }


    function playNext() {

        if (!activePlaybackList.length) {
    return;
}

        if (activePlaybackIndex < 0) {

            playSong(
    activePlaybackList[0],
    0,
    activePlaybackList
);

            return;
        }

        let nextIndex;
        

if (window.AlignMusicExtras?.shuffle) {
    do {
        nextIndex =
            Math.floor(
                Math.random() * activePlaybackList.length
            );
    } while (
        activePlaybackList.length > 1 &&
nextIndex === activePlaybackIndex
    );
} else {
    nextIndex = activePlaybackIndex + 1;
}

        if (nextIndex >= activePlaybackList.length) {
    if (nextPageToken) {
        searchMusic(
            lastSearchQuery,
            nextPageToken
        );
        return;
    }

    playSong(
        activePlaybackList[0],
        0,
        activePlaybackList
    );
    return;
}
activePlaybackIndex = nextIndex;
        playSong(
    activePlaybackList[nextIndex],
    nextIndex,
    activePlaybackList
);
    }


    /* =========================================================
       PLAYER UI
    ========================================================= */

    function updatePlayerUI() {

        if (!currentSong) {
            return;
        }

        if (playerTitle) {

            playerTitle.textContent =
                currentSong.title;
        }

        if (playerArtist) {

            playerArtist.textContent =
                currentSong.channelTitle;
        }

        if (playerArtwork) {

            const image =
                getSongImage(
                    currentSong
                );

            if (image) {

                playerArtwork.innerHTML =
                    `
                        <img
                            src="${escapeHtml(image)}"
                            alt="">
                    `;

            }
            else {

                playerArtwork.innerHTML =
                    "<span>♪</span>";
            }
        }

        if (currentTime) {
            currentTime.textContent =
                "0:00";
        }

        if (duration) {
            duration.textContent =
                "0:00";
        }

        if (progress) {
            progress.value =
                "0";
        }
        const likeButton = document.getElementById("musicLike");
const likeIcon = likeButton?.querySelector(".music-action-icon");

if (likeButton && likeIcon && currentSong) {
    const likes = window.AlignMusicExtras?.likes || [];

    const liked = likes.some(
        item => item.videoId === currentSong.videoId
    );

    likeIcon.textContent = liked ? "♥" : "♡";
    likeButton.classList.toggle("active", liked);
}
    }


    function updatePlayButton(
        playing
    ) {

        if (!playPauseButton) {
            return;
        }

        playPauseButton.textContent =
            playing
                ? "❚❚"
                : "▶";

        playPauseButton.setAttribute(
            "aria-label",
            playing
                ? "Pause"
                : "Play"
        );
    }


    /* =========================================================
       PROGRESS
    ========================================================= */

    function startProgressTimer() {

        stopProgressTimer();

        progressTimer =
            setInterval(() => {

                updateProgress();
                savePlaybackState();

            }, 500);
    }


    function stopProgressTimer() {

        if (progressTimer) {

            clearInterval(
                progressTimer
            );

            progressTimer =
                null;
        }
    }


    function updateProgress() {

        if (
            !playerReady ||
            !player ||
            !currentSong
        ) {
            return;
        }

        try {

            const current =
                player.getCurrentTime();

            const total =
                player.getDuration();

            if (
                !Number.isFinite(current) ||
                !Number.isFinite(total) ||
                total <= 0
            ) {
                return;
            }

            if (currentTime) {

                currentTime.textContent =
                    formatTime(
                        current
                    );
            }

            if (duration) {

                duration.textContent =
                    formatTime(
                        total
                    );
            }

            if (progress) {

                progress.value =
                    String(
                        Math.min(
                            100,
                            (
                                current /
                                total
                            ) * 100
                        )
                    );
            }

        }
        catch {
            // Player may not be ready.
        }
    }


    function seekToPercent(
        value
    ) {

        if (
            !playerReady ||
            !player ||
            !currentSong
        ) {
            return;
        }

        try {

            const total =
                player.getDuration();

            if (
                !Number.isFinite(total) ||
                total <= 0
            ) {
                return;
            }

            const target =
                (
                    Number(value) /
                    100
                ) * total;

            player.seekTo(
                target,
                true
            );

        }
        catch {
            // Ignore seek errors.
        }
    }


    /* =========================================================
       VOLUME
    ========================================================= */

    function setVolume(
        value
    ) {

        const numericValue =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(value) || 0
                )
            );

        if (volume) {

            volume.value =
                String(
                    numericValue
                );
        }

        localStorage.setItem(
            STORAGE_KEYS.volume,
            String(
                numericValue
            )
        );

        if (
            playerReady &&
            player
        ) {

            player.setVolume(
                numericValue
            );
        }

    }

    
    /* =========================================================
       FAVORITES
    ========================================================= */

    function toggleFavorite(
        song
    ) {

        if (!song?.videoId) {
            return;
        }

        const existingIndex =
            favorites.findIndex(
                item =>
                    item.videoId ===
                    song.videoId
            );

        if (
            existingIndex >= 0
        ) {

            favorites.splice(
                existingIndex,
                1
            );

            showToast(
                "Removed from favorites."
            );

        }
        else {

            favorites.unshift(
                normalizeSong(
                    song
                )
            );

            showToast(
                "Added to favorites."
            );
        }

        saveStorage(
            STORAGE_KEYS.favorites,
            favorites
        );

        renderResults();

        renderFavorites();
    }
    window.AlignMusicFavoritesToggle =
    toggleFavorite;


    function renderFavorites() {

        if (!favoritesContainer) {
            return;
        }

        if (!favorites.length) {

            favoritesContainer.innerHTML =
                `
                    <div class="music-mini-empty">
                        No favorites yet.
                    </div>
                `;

            return;
        }

        favoritesContainer.innerHTML =
            favorites
                .slice(
                    0,
                    20
                )
                .map(
                    song =>
                        renderMiniSong(
                            song,
                            "favorite"
                        )
                )
                .join("");
    }

        const playAllFavoritesButton =
        document.getElementById("musicPlayAllFavorites");

    if (playAllFavoritesButton) {
        playAllFavoritesButton.addEventListener(
            "click",
            () => {
                if (!favorites.length) {
                    showToast("No favorites to play.");
                    return;
                }

                playSong(
    favorites[0],
    0,
    favorites
);
            }
        );
    }


    /* =========================================================
       RECENT
    ========================================================= */

    function addToRecent(
        song
    ) {

        if (!song?.videoId) {
            return;
        }

        recent =
            recent.filter(
                item =>
                    item.videoId !==
                    song.videoId
            );

        recent.unshift(
            normalizeSong(
                song
            )
        );

        recent =
            recent.slice(
                0,
                MAX_RECENT
            );

        saveStorage(
            STORAGE_KEYS.recent,
            recent
        );
    }


    function renderRecent() {

        if (!recentContainer) {
            return;
        }

        if (!recent.length) {

            recentContainer.innerHTML =
                `
                    <div class="music-mini-empty">
                        Nothing played yet.
                    </div>
                `;

            return;
        }

        recentContainer.innerHTML =
            recent
                .slice(
                    0,
                    20
                )
                .map(
                    song =>
                        renderMiniSong(
                            song,
                            "recent"
                        )
                )
                .join("");
    }
    const playAllRecentButton =
    document.getElementById("musicPlayAllRecent");

if (playAllRecentButton) {
    playAllRecentButton.addEventListener(
        "click",
        () => {
            if (!recent.length) {
                showToast("No recently played songs.");
                return;
            }

            playSong(
                recent[0],
                0,
                recent
            );
        }
    );
}


    function renderMiniSong(
        song,
        type
    ) {

        const image =
            getSongImage(
                song
            );

        return `
            <div
                class="music-mini-item"
                data-video-id="${escapeHtml(song.videoId)}"
                data-mini-type="${type}">

                ${
                    image
                        ? `
                            <img
                                class="music-mini-image"
                                src="${escapeHtml(image)}"
                                alt=""
                                loading="lazy">
                          `
                        : `
                            <div
                                class="music-mini-image"
                                style="
                                    display:grid;
                                    place-items:center;
                                    color:#8b5cf6;
                                    font-size:20px;
                                ">
                                ♪
                            </div>
                          `
                }

                <div class="music-mini-info">

                    <div class="music-mini-title">
                        ${escapeHtml(song.title)}
                    </div>

                    <div class="music-mini-channel">
                        ${escapeHtml(song.channelTitle)}
                    </div>

                </div>
                ${
    type === "favorite"
        ? `
            <button
                type="button"
                class="music-favorite-remove"
                data-remove-favorite="${escapeHtml(song.videoId)}"
                aria-label="Remove from favorites">
                ×
            </button>
          `
        : ""
}

            </div>
        `;
    }


    /* =========================================================
       PAGINATION
    ========================================================= */

    function updatePagination() {

        if (!pagination) {
            return;
        }

        const show =
            Boolean(
                nextPageToken ||
                previousPageToken
            );

        pagination.classList.toggle(
            "hidden",
            !show
        );

        if (previousButton) {

            previousButton.disabled =
                !previousPageToken;
        }

        if (nextButton) {

            nextButton.disabled =
                !nextPageToken;
        }
    }


    /* =========================================================
       CLEAR
    ========================================================= */

    function clearSearch() {

        if (searchInput) {
            searchInput.value =
                "";
        }

        results = [];

        nextPageToken = null;

        previousPageToken = null;

        lastSearchQuery = "";

        resultsContainer.innerHTML =
            "";

        resultsInfo.textContent =
            "Search for a song to get started.";

        emptyState.classList.remove(
            "hidden"
        );

        clearButton.classList.add(
            "hidden"
        );
        if (resultsSection) {
    resultsSection.classList.add("hidden");
}

        pagination.classList.add(
            "hidden"
        );
    }


    /* =========================================================
       EVENTS
    ========================================================= */

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                searchMusic(
                    searchInput.value
                );
            }
        );
    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearSearch
        );
    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (
                    previousPageToken
                ) {

                    searchMusic(
                        lastSearchQuery,
                        previousPageToken
                    );
                }
            }
        );
    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (
                    nextPageToken
                ) {

                    searchMusic(
                        lastSearchQuery,
                        nextPageToken
                    );
                }
            }
        );
    }


   if (resultsContainer) {
    resultsContainer.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) {
                return;
            }

            const index =
                Number(
                    button.dataset.index
                );

            const song =
                results[index];

            if (!song) {
                return;
            }

            const action =
                button.dataset.action;

            if (action === "play") {

                playSong(
                    song,
                    index
                );
                clearSearch();
                window.scrollTo({
    top: 0,
    behavior: "smooth"
});

                expandMusicPlayer();

                return;
            }

            if (action === "favorite") {

                toggleFavorite(
                    song
                );

                return;
            }
        }
    );
}


    if (favoritesContainer) {

        favoritesContainer.addEventListener(
            "click",
            event => {
                const removeButton =
    event.target.closest(
        "[data-remove-favorite]"
    );

if (removeButton) {
    const videoId =
        removeButton.dataset.removeFavorite;

    favorites =
        favorites.filter(
            song =>
                song.videoId !== videoId
        );

    saveStorage(
        STORAGE_KEYS.favorites,
        favorites
    );

    renderFavorites();
    renderResults();

    showToast(
        "Removed from favorites."
    );

    return;
}

                const item =
                    event.target.closest(
                        ".music-mini-item"
                    );

                if (!item) {
                    return;
                }

                const videoId =
                    item.dataset.videoId;

                const song =
                    favorites.find(
                        favorite =>
                            favorite.videoId ===
                            videoId
                    );

                if (song) {

                    playSong(
                        song
                    );
                }
            }
        );
    }


    if (recentContainer) {

        recentContainer.addEventListener(
            "click",
            event => {
                

                const item =
                    event.target.closest(
                        ".music-mini-item"
                    );

                if (!item) {
                    return;
                }

                const videoId =
                    item.dataset.videoId;

                const song =
                    recent.find(
                        recentSong =>
                            recentSong.videoId ===
                            videoId
                    );

                if (song) {

                    playSong(
                        song
                    );
                }
            }
        );
    }


    if (playPauseButton) {

        playPauseButton.addEventListener(
            "click",
            togglePlayPause
        );
    }


    if (playerPreviousButton) {

        playerPreviousButton.addEventListener(
            "click",
            playPrevious
        );
    }


    if (playerNextButton) {

        playerNextButton.addEventListener(
            "click",
            playNext
        );
    }


    if (progress) {

        progress.addEventListener(
            "input",
            event => {

                seekToPercent(
                    event.target.value
                );
            }
        );
    }


    if (volume) {

        volume.addEventListener(
            "input",
            event => {

                setVolume(
                    event.target.value
                );
            }
        );
    }


    if (musicPlayerClose) {
        musicPlayerClose.addEventListener(
            "click",
            () => collapseMusicPlayer(true)
        );
    }

    window.addEventListener(
        "popstate",
        () => {
            if (location.hash !== "#player") {
                collapseMusicPlayer(false);
            }
        }
    );

        /* =========================================================
       INITIALIZE
    ========================================================= */

    renderFavorites();

    renderRecent();

    /*
     * If the YouTube API has already loaded
     * before this script executes.
     */

    if (
        window.YT &&
        window.YT.Player
    ) {

        createYouTubePlayer();
    }


    /* Public bridge for player extras */
    window.AlignMusicPlayer = {
    playSong: (song, index = -1, playbackList = null) =>
        playSong(song, index, playbackList),
    getCurrentSong: () => currentSong
};

})();



(() => {
    "use strict";

   const EXTRA_KEYS = {
    playlists: "alignMusicPlaylists"
};

    const extraLoad = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    };

    const extraSave = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Unable to save ${key}`, error);
        }
    };

    const extraEscapeHtml = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const extraSong = song => ({
        videoId: song?.videoId || null,
        title: song?.title || "Unknown title",
        channelTitle: song?.channelTitle || "YouTube",
        thumbnails: song?.thumbnails || {}
    });

    let extraPlaylists = extraLoad(EXTRA_KEYS.playlists, []);
    let extraShuffle = false;
    let extraRepeat = false;

    const extraPlayer = document.getElementById("musicPlayer");
    const extraPlay = document.getElementById("musicPlayPause");
    const extraPrev = document.getElementById("musicPrevious");
    const extraNext = document.getElementById("musicNext");
    const extraVolume = document.getElementById("musicVolume");
    const extraToast = document.getElementById("musicToast");

    // Keep the feature state accessible to the existing music.js where possible.
    window.AlignMusicExtras = {
        get shuffle() { return extraShuffle; },
        get repeat() { return extraRepeat; },
        get likes() {
    return JSON.parse(
        localStorage.getItem("alignMusicFavorites") || "[]"
    );
},
        get playlists() { return extraPlaylists; },
        
        toggleLike(song) {
    if (!song?.videoId) return;

    if (
        typeof window.AlignMusicFavoritesToggle ===
        "function"
    ) {
        window.AlignMusicFavoritesToggle(song);
    }
}
    };

    function notify(message) {
        if (!extraToast) return;
        extraToast.textContent = message;
        extraToast.classList.add("show");
        clearTimeout(notify.timer);
        notify.timer = setTimeout(() => extraToast.classList.remove("show"), 2200);
    }

    function current() {
        return window.AlignMusicPlayer?.getCurrentSong?.() || null;
    }

    function playSong(song, index = -1, playbackList = null) {
    if (!song?.videoId) return;

    if (typeof window.AlignMusicPlayer?.playSong === "function") {
        window.AlignMusicPlayer.playSong(
            song,
            index,
            playbackList
        );
        return;
    }
        // Fallback: click matching result card if the main script exposes no API.
        const button = [...document.querySelectorAll('[data-action="play"]')]
            .find(el => el.dataset.videoId === song.videoId);
        if (button) button.click();
    }

    function refreshLikeButtons() {
    document
        .querySelectorAll("#musicLike")
        .forEach(button => {

            const song =
                current();

            if (!song?.videoId) {
                button.textContent = "♡";
                button.classList.remove(
                    "active"
                );
                return;
            }

            const favorites =
                JSON.parse(
                    localStorage.getItem(
                        "alignMusicFavorites"
                    ) || "[]"
                );

            const liked =
                favorites.some(
                    item =>
                        item.videoId ===
                        song.videoId
                );

            button.textContent =
                liked ? "♥" : "♡";

            button.classList.toggle(
                "active",
                liked
            );
        });
}


   function renderPlaylists() {
    const container =
        document.getElementById("musicPlaylists");

    if (!container) {
        return;
    }

    if (!extraPlaylists.length) {
        container.innerHTML = `
            <div class="music-mini-empty">
                No playlists yet.
            </div>
        `;
        return;
    }

    container.innerHTML =
    extraPlaylists.map(playlist => `
        <div
            class="music-mini-item music-playlist-item"
            data-playlist-id="${playlist.id}"
        >
            <button
                type="button"
                class="music-playlist-open"
                data-playlist-id="${playlist.id}"
            >
                <div class="music-mini-art music-playlist-art">
                    🎵
                </div>

                <div class="music-mini-content">
                    <div class="music-mini-title">
                        ${extraEscapeHtml(playlist.name)}
                    </div>

                    <div class="music-mini-meta">
                        ${playlist.songs.length}
                        ${playlist.songs.length === 1 ? "song" : "songs"}
                    </div>
                </div>
            </button>

            <button
                type="button"
                class="music-playlist-delete"
                data-playlist-delete-id="${playlist.id}"
                aria-label="Delete playlist"
                title="Delete playlist">
                ×
            </button>
        </div>
    `).join("");
}
function showPlaylistSongs(playlist) {
    if (!playlist) {
        return;
    }

    const existing =
        document.getElementById("musicPlaylistSongsModal");

    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");

    overlay.id = "musicPlaylistSongsModal";
    overlay.className = "music-playlist-songs-overlay";

    overlay.innerHTML = `
        <div class="music-standalone-modal-box">

            <div class="music-standalone-modal-header">
    <div>
        <h3>${extraEscapeHtml(playlist.name)}</h3>
        <p>
            ${playlist.songs.length}
            ${playlist.songs.length === 1 ? "song" : "songs"}
        </p>
    </div>

    <div style="
        display:flex;
        align-items:center;
        gap:8px;
    ">
        ${
            playlist.songs.length
                ? `
                    <button
                        type="button"
                        id="musicPlaylistPlayAll"
                        class="music-play-all-button">
                        ▶ Play All
                    </button>
                `
                : ""
        }

        <button
            type="button"
            class="music-standalone-modal-close"
            id="musicPlaylistSongsClose">
            ×
        </button>
    </div>
</div>

            <div class="music-playlist-view-list">
    ${
        playlist.songs.length
            ? playlist.songs.map((song, index) => `
                <div class="music-playlist-song-row">

    <button
        type="button"
        class="music-playlist-view-song"
        data-playlist-song-index="${index}">

        <div class="music-playlist-view-number">
            ${index + 1}
        </div>

        <div class="music-playlist-view-info">
            <strong>
                ${extraEscapeHtml(song.title)}
            </strong>

            <small>
                ${extraEscapeHtml(
                    song.artist || "Unknown artist"
                )}
            </small>
        </div>
    </button>

    <button
        type="button"
        class="music-playlist-song-delete"
        data-playlist-delete-index="${index}"
        aria-label="Remove song">
        ×
    </button>

</div>
            `).join("")
            : `
                <div class="music-playlist-modal-empty">
                    This playlist is empty.
                </div>
            `
    }
</div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeButton =
        document.getElementById("musicPlaylistSongsClose");

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            overlay.remove();
        });
    }
    const playAllButton =
    document.getElementById("musicPlaylistPlayAll");

if (playAllButton) {
    playAllButton.addEventListener("click", () => {
        if (!playlist.songs.length) {
            notify("This playlist is empty.");
            return;
        }

        playSong(
            playlist.songs[0],
            0,
            playlist.songs
        );

        overlay.remove();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
overlay
    .querySelectorAll("[data-playlist-delete-index]")
    .forEach(button => {
        button.addEventListener("click", event => {
            event.stopPropagation();

            const index = Number(
                button.dataset.playlistDeleteIndex
            );

            if (
                !Number.isInteger(index) ||
                !playlist.songs[index]
            ) {
                return;
            }

            playlist.songs.splice(index, 1);

            extraSave(
                EXTRA_KEYS.playlists,
                extraPlaylists
            );

            renderPlaylists();

            notify("Song removed from playlist.");

            overlay.remove();

            showPlaylistSongs(playlist);
        });
    });

    overlay
        .querySelectorAll("[data-playlist-song-index]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const index =
                    Number(
                        button.dataset.playlistSongIndex
                    );

                playSong(
                    playlist.songs[index],
                    index,
                    playlist.songs
                );

                overlay.remove();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        });
}
function openMusicPlaylistModal(song) {
    if (!song) {
        return;
    }

    const existing =
        document.getElementById("musicPlaylistStandaloneModal");

    if (existing) {
        existing.remove();
    }

    const playlistOptions = extraPlaylists.length
        ? extraPlaylists.map(playlist => `
            <button
                type="button"
                class="music-playlist-modal-item"
                data-standalone-playlist-id="${playlist.id}">
                <div class="music-playlist-modal-icon">🎵</div>

                <div class="music-playlist-modal-info">
                    <strong>${extraEscapeHtml(playlist.name)}</strong>
                    <small>
                        ${playlist.songs.length}
                        ${playlist.songs.length === 1 ? "song" : "songs"}
                    </small>
                </div>

                <span class="music-playlist-modal-arrow">›</span>
            </button>
        `).join("")
        : `
            <div class="music-playlist-modal-empty">
                No playlists yet.
            </div>
        `;

    const overlay = document.createElement("div");

    overlay.id = "musicPlaylistStandaloneModal";

    overlay.innerHTML = `
        <div class="music-standalone-modal-box">

            <div class="music-standalone-modal-header">
                <div>
                    <h3>Add to Playlist</h3>
                    <p>${extraEscapeHtml(song.title)}</p>
                </div>

                <button
                    type="button"
                    class="music-standalone-modal-close"
                    id="musicPlaylistModalClose">
                    ×
                </button>
            </div>

            <div class="music-standalone-playlist-list">
                ${playlistOptions}
            </div>

            <button
                type="button"
                id="musicStandaloneNewPlaylist"
                class="music-standalone-new-playlist">
                ＋ New Playlist
            </button>

        </div>
    `;

    document.body.appendChild(overlay);
    const closeButton =
    document.getElementById("musicPlaylistModalClose");

if (closeButton) {
    closeButton.addEventListener("click", () => {
        overlay.remove();
    });
}
overlay.querySelectorAll("[data-standalone-playlist-id]").forEach(button => {
    button.addEventListener("click", () => {
        const playlist = extraPlaylists.find(
            item =>
                item.id ===
                button.dataset.standalonePlaylistId
        );

        if (!playlist) {
            return;
        }

        if (
            playlist.songs.some(
                item => item.videoId === song.videoId
            )
        ) {
            notify("Song is already in this playlist.");
            return;
        }

        playlist.songs.push(extraSong(song));

        extraSave(
            EXTRA_KEYS.playlists,
            extraPlaylists
        );

        renderPlaylists();

        notify(`Added to ${playlist.name}.`);

        overlay.remove();
    });
});
const newPlaylistButton =
    document.getElementById("musicStandaloneNewPlaylist");

if (newPlaylistButton) {
    newPlaylistButton.addEventListener("click", () => {
        overlay.style.display = "none";

        openMusicCreatePlaylistModal(song);
    });
}
}
function openMusicCreatePlaylistModal(song) {
    if (!song) {
        return;
    }

    const existing =
        document.getElementById("musicCreatePlaylistStandaloneModal");

    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");

    overlay.id = "musicCreatePlaylistStandaloneModal";

    overlay.innerHTML = `
        <div class="music-standalone-modal-box">

            <div class="music-standalone-modal-header">
                <div>
                    <h3>New Playlist</h3>
                    <p>Create a playlist for your music</p>
                </div>

                <button
                    type="button"
                    class="music-standalone-modal-close"
                    id="musicCreatePlaylistModalClose">
                    ×
                </button>
            </div>

            <input
                id="musicStandalonePlaylistName"
                type="text"
                maxlength="60"
                placeholder="Enter playlist name"
                autocomplete="off"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:12px 14px;
                    border:1px solid #cbd5e1;
                    border-radius:12px;
                    outline:none;
                    font-size:14px;
                ">

            <div style="
                display:flex;
                justify-content:flex-end;
                gap:10px;
                margin-top:16px;
            ">
                <button
                    type="button"
                    id="musicCreatePlaylistCancel"
                    class="music-secondary-button">
                    Cancel
                </button>

                <button
                    type="button"
                    id="musicCreatePlaylistConfirm"
                    class="music-primary-button">
                    Create Playlist
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(overlay);
    overlay.style.position = "fixed";
overlay.style.inset = "0";
overlay.style.zIndex = "100000";
overlay.style.display = "flex";
overlay.style.alignItems = "center";
overlay.style.justifyContent = "center";
overlay.style.padding = "20px";
overlay.style.boxSizing = "border-box";
    const input =
    document.getElementById("musicStandalonePlaylistName");

const closeButton =
    document.getElementById("musicCreatePlaylistModalClose");

const cancelButton =
    document.getElementById("musicCreatePlaylistCancel");

const confirmButton =
    document.getElementById("musicCreatePlaylistConfirm");

if (input) {
    input.focus();
}

if (closeButton) {
    closeButton.addEventListener("click", () => {
        overlay.remove();
    });
}

if (cancelButton) {
    cancelButton.addEventListener("click", () => {
        overlay.remove();
    });
}
if (confirmButton) {
    confirmButton.addEventListener("click", () => {
        const name = input?.value.trim();

        if (!name) {
            notify("Enter a playlist name.");
            return;
        }

        const exists = extraPlaylists.some(
            playlist =>
                playlist.name.toLowerCase() ===
                name.toLowerCase()
        );

        if (exists) {
            notify("Playlist already exists.");
            return;
        }

        const playlist = {
            id: `playlist-${Date.now()}`,
            name,
            songs: [
                extraSong(song)
            ]
        };

        extraPlaylists.push(playlist);

        extraSave(
            EXTRA_KEYS.playlists,
            extraPlaylists
        );

        renderPlaylists();

        notify(`Created ${playlist.name}.`);

        overlay.remove();
    });
}
}
    function addPlayerActionButtons() {
        if (!extraPlayer) return;
        let actions = document.getElementById("musicExtraActions");
        if (actions) return;

        actions = document.createElement("div");
        actions.id = "musicExtraActions";
        actions.className = "music-extra-actions";
        actions.innerHTML = `
            <button
    type="button"
    id="musicShuffle"
    class="music-player-action"
    aria-label="Shuffle"
    title="Shuffle">
    <span class="music-action-icon">⤨</span>
    
</button>

<button
    type="button"
    id="musicRepeat"
    class="music-player-action"
    aria-label="Repeat"
    title="Repeat">
    <span class="music-action-icon">↻</span>
   
</button>

<button
    type="button"
    id="musicLike"
    class="music-player-action"
    aria-label="Like"
    title="Like">
    <span class="music-action-icon">♡</span>
    
</button>

<button
    type="button"
    id="musicPlaylist"
    class="music-player-action"
    aria-label="Add to playlist"
    title="Add to playlist">
    <span class="music-action-icon">＋</span>
    <span>Playlist</span>
</button>
        `;
        const controls = extraPlayer.querySelector(".music-player-controls");
        if (controls) controls.parentNode.insertBefore(actions, controls);

        actions.querySelector("#musicShuffle").addEventListener("click", () => {
            extraShuffle = !extraShuffle;
            actions.querySelector("#musicShuffle").classList.toggle("active", extraShuffle);
            notify(extraShuffle ? "Shuffle on." : "Shuffle off.");
        });

        actions.querySelector("#musicRepeat").addEventListener("click", () => {
            extraRepeat = !extraRepeat;
            actions.querySelector("#musicRepeat").classList.toggle("active", extraRepeat);
            notify(extraRepeat ? "Repeat on." : "Repeat off.");
        });
        
        actions.querySelector("#musicLike").addEventListener("click", () => {
    const song = current();

    if (!song) {
        return;
    }

    window.AlignMusicFavoritesToggle(song);

    const likeButton = actions.querySelector("#musicLike");
    const icon = likeButton.querySelector(".music-action-icon");

    if (icon) {
        const likes = window.AlignMusicExtras?.likes || [];
        const liked = likes.some(item => item.videoId === song.videoId);

        icon.textContent = liked ? "♥" : "♡";
        likeButton.classList.toggle("active", liked);
    }
});

       actions.querySelector("#musicPlaylist").addEventListener("click", () => {
    const song = current();

    if (!song) {
        notify("Choose a song first.");
        return;
    }

    openMusicPlaylistModal(song);
});
    }
    const playlistsContainer =
    document.getElementById("musicPlaylists");
    

if (playlistsContainer) {
    playlistsContainer.addEventListener(
        "click",
        event => {
            const deleteButton =
    event.target.closest("[data-playlist-delete-id]");

if (deleteButton) {
    event.stopPropagation();

    const playlistId =
        deleteButton.dataset.playlistDeleteId;

    const playlist =
        extraPlaylists.find(
            item => item.id === playlistId
        );

    if (!playlist) {
        return;
    }

    const existingModal =
        document.getElementById(
            "musicDeletePlaylistModal"
        );

    if (existingModal) {
        existingModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.id =
        "musicDeletePlaylistModal";

    modal.className =
        "music-playlist-songs-overlay";

    modal.innerHTML = `
        <div class="music-standalone-modal-box">

            <div class="music-standalone-modal-header">
                <div>
                    <h3>Delete Playlist</h3>

                    <p>
                        Are you sure you want to delete
                        <strong>
                            ${extraEscapeHtml(playlist.name)}
                        </strong>?
                    </p>
                </div>

                <button
                    type="button"
                    class="music-standalone-modal-close"
                    id="musicDeletePlaylistClose">
                    ×
                </button>
            </div>

            <div style="
                display:flex;
                justify-content:flex-end;
                gap:10px;
                margin-top:20px;
            ">

                <button
                    type="button"
                    id="musicDeletePlaylistCancel"
                    class="music-secondary-button">
                    Cancel
                </button>

                <button
                    type="button"
                    id="musicDeletePlaylistConfirm"
                    class="music-primary-button"
                    style="
                        background:#dc2626;
                        border-color:#dc2626;
                    ">
                    Delete
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
        modal.remove();
    };

    document
        .getElementById(
            "musicDeletePlaylistClose"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById(
            "musicDeletePlaylistCancel"
        )
        ?.addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById(
            "musicDeletePlaylistConfirm"
        )
        ?.addEventListener(
            "click",
            () => {

                const index =
                    extraPlaylists.findIndex(
                        item =>
                            item.id ===
                            playlistId
                    );

                if (index === -1) {
                    closeModal();
                    return;
                }

                extraPlaylists.splice(
                    index,
                    1
                );

                extraSave(
                    EXTRA_KEYS.playlists,
                    extraPlaylists
                );

                renderPlaylists();

                closeModal();

                notify(
                    `Deleted ${playlist.name}.`
                );
            }
        );

    return;
}
            const item =
                event.target.closest(
                    "[data-playlist-id]"
                );

            if (!item) {
                return;
            }

            const playlist =
                extraPlaylists.find(
                    p =>
                        p.id ===
                        item.dataset.playlistId
                );

            if (!playlist) {
                return;
            }

            showPlaylistSongs(playlist);
        }
    );
}

     addPlayerActionButtons();
     renderPlaylists();
    
})();

