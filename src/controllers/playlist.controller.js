import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const user = req.user._id;

  if (!name) {
    throw new ApiError(400, "Please Enter the Name of Playlist");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: user,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  const userPlaylist = await Playlist.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "Playlists Fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Failed to fetch the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //  jiska account ho ussi ki id ki playlist dikhaye
  const user = req.user._id;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  if (user.toString() !== playlist.owner.toString()) {
    throw new ApiError(400, "Not authorised to add videos");
  }

  const video = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );
  res.status(200).json(new ApiResponse(200, {}, "Added video successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const user = req.user._id;
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  if (user.toString() !== playlist.owner.toString()) {
    throw new ApiError(400, "User not authorized");
  }

  await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: videoId,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const user = req.user._id;
  const playlist = await Playlist.findById(playlistId);
  if (user.toString() !== playlist.owner.toString()) {
    throw new ApiError(400, "User not authorized");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!(name || description)) {
    throw new ApiError(400, "Please Enter the details");
  }
  const user = req.user._id;

  const playlist = await Playlist.findById(playlistId);
  if (user.toString() !== playlist.owner.toString()) {
    throw new ApiError(400, "User not authorized");
  }

  await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    {
      new: true,
    }
  );

  return res.status(200).json(new ApiResponse(200, {}, "Playlist Updated"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
