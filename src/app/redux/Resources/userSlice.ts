"use client";

import { createSlice } from "@reduxjs/toolkit";

export interface User {
  username: string;
  role: string;
  year: number;
  gender: string;
  room: string;
}

const initialState: User | null = null;

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => action.payload,
    removeUser: () => null,
  },
});

export const { setUser, removeUser } = userSlice.actions;
export const selectUser = (state: { user: User | null }) => state.user;
export default userSlice.reducer;
