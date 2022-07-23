import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: {
    title: '',
    fileId: '',
    stymId: '',
    folderId: '',
    image: '',
    src: '',
    link: '',
    isPlaying: false,
    inboxId: '',
  },
  currentPlaylist: [],
  playMode: '',
};

export const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      state.currentTrack.title = action.payload.title;
      state.currentTrack.link = action.payload.link;
      state.currentTrack.fileId = action.payload.fileId;
      state.currentTrack.stymId = action.payload.stymId;
      state.currentTrack.folderId = action.payload.folderId;
      state.currentTrack.image = action.payload.image;
      state.currentTrack.src = action.payload.src;
      state.currentTrack.isPlaying = true;
      state.playMode = action.payload.playMode;
      state.currentTrack.inboxId = action.payload.inboxId;
    },
    startPlayback: (state) => {
      state.currentTrack.isPlaying = true;
    },
    pausePlayback: (state) => {
      state.currentTrack.isPlaying = false;
    },
    setPlaylist: (state, action) => {
      state.currentPlaylist = action.payload;
      state.playMode = 'playlist';
    },
  },
});

export const {
  setCurrentTrack,
  pausePlayback,
  togglePlayback,
  startPlayback,
  setPlaylist,
} = audioSlice.actions;
export default audioSlice.reducer;
