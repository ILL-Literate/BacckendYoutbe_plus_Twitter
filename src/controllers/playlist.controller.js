
import { apiError } from "../utlisnew/apierror.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import  {asyncHandler} from "../utilsnew/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const playlist = await Playlist.create({
        name,
        description,
        user: req.user._id
    });

    res.status(201).json(playlist);
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const playlists = await Playlist.find({ user: userId });

    res.status(200).json(playlists);
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId).populate('videos');

    if (!playlist) {
        res.status(404);
        throw new Error('Playlist not found');
    }

    res.status(200).json(playlist);
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        res.status(404);
        throw new Error('Playlist not found');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(playlist);
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        res.status(404);
        throw new Error('Playlist not found');
    }

    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId);
    await playlist.save();

    res.status(200).json(playlist);
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        res.status(404);
        throw new Error('Playlist not found');
    }

    await playlist.remove();

    res.status(200).json({ message: 'Playlist deleted successfully' });
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
};