"use client";

import { configureStore } from "@reduxjs/toolkit";

import userReducer from "@/src/app/redux/Resources/userSlice";
import type { User } from "@/src/app/redux/Resources/userSlice";

// Saves user data into a session storage
const saveState = (state: User | null) => {
  try {
    // Convert the state to a JSON string
    const serialisedState = JSON.stringify(state);

    // Save the serialised state to localStorage against the key 'app_state'
    localStorage.setItem("user_state", serialisedState);
  } catch (err) {
    // Log errors here, or ignore
    console.error(err);
  }
};

// Checks if user is saved in session storage
const loadState = () => {
  try {
    if (typeof window === `undefined`) return null;
    const serialisedState = localStorage.getItem("user_state");

    // Passing undefined to createStore will result in our app getting the default state
    // If no data is saved, return undefined
    if (!serialisedState) return null;

    const item = JSON.parse(serialisedState);
    return item;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const oldState = loadState();
const savedUser: User | null =
  oldState == null
    ? null
    : {
        username: oldState.username,
        role: oldState.role,
        year: oldState.year,
        gender: oldState.gender,
        room: oldState.room,
      };
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: { user: savedUser },
});

store.subscribe(() => {
  saveState(store.getState().user);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
