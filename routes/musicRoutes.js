const express = require("express");

const router = express.Router();

const musicController =
    require("../controllers/musicController");

const musicUserController =
    require("../controllers/musicUserController");

const musicAuthMiddleware =
    require("../middlewares/musicAuthMiddleware");


router.get(
    "/search",
    musicController.search
);

router.post(
    "/save",
    musicController.save
);

router.post(
    "/add-youtube",
    musicController.addYouTubeSong
);

router.get(
    "/discover",
    musicController.discover
);


/*
 * Account Favorites
 */

router.get(
    "/favorites",
    musicAuthMiddleware,
    musicUserController.getFavorites
);

router.post(
    "/favorites/add",
    musicAuthMiddleware,
    musicUserController.addFavorite
);

router.post(
    "/favorites/remove",
    musicAuthMiddleware,
    musicUserController.removeFavorite
);


/*
 * Account Playlists
 */

router.get(
    "/playlists",
    musicAuthMiddleware,
    musicUserController.getPlaylists
);

router.post(
    "/playlists/create",
    musicAuthMiddleware,
    musicUserController.createPlaylist
);

router.post(
    "/playlists/rename",
    musicAuthMiddleware,
    musicUserController.renamePlaylist
);

router.post(
    "/playlists/delete",
    musicAuthMiddleware,
    musicUserController.deletePlaylist
);

router.post(
    "/playlists/songs/add",
    musicAuthMiddleware,
    musicUserController.addSongToPlaylist
);

router.post(
    "/playlists/songs/remove",
    musicAuthMiddleware,
    musicUserController.removeSongFromPlaylist
);


module.exports = router;
