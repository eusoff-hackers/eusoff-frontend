"use client";

import React, { useEffect, useState } from "react";

import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import type { User } from "@/src/app/redux/Resources/userSlice";
import { selectUser, setUser } from "@/src/app/redux/Resources/userSlice";

const axios = require("axios").default;
axios.defaults.withCredentials = true;

export default function LoginForm() {
  const user = useSelector(selectUser);
  const router = useRouter();

  useEffect(() => {
    if (user !== null) {
      router.push(`/dashboard/jersey`);
    }
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/login`, {
        credentials: {
          username,
          password,
        },
      });

      if (response.data.success) {
        const newUser: User = {
          username: response.data.data.user.username,
          role: response.data.data.user.role,
          year: response.data.data.user.year,
          gender: response.data.data.user.gender,
          room: response.data.data.user.room,
        };

        dispatch(setUser(newUser));
        router.replace("/dashboard/jersey");
      }
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response.status == 401) {
        setError("Invalid username or password");
        console.error("Unauthorised");
      }
      console.error("Error during login", error);
    }
  };

  return (
    <div className="flex w-full flex-col rounded-xl bg-white p-10 shadow-xl">
      <h2 className="mb-5 text-left text-2xl font-bold text-gray-800">Login</h2>
      <form onSubmit={e => handleSubmit(e)} className="w-full">
        <div id="input" className="my-5 flex w-full flex-col">
          <label htmlFor="username" className="mb-2 text-gray-500">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Please insert your matric number"
            className="appearance-none rounded-lg border-2 border-gray-100 px-4 py-3 text-black placeholder-gray-300 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div id="input" className="my-5 flex w-full flex-col">
          <label htmlFor="password" className="mb-2 text-gray-500">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Please insert your password"
            className="appearance-none rounded-lg border-2 border-gray-100 px-4 py-3 text-black placeholder-gray-300 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        {error == "" ? <></> : <div className="font-bold text-red-500">{error}!</div>}
        <div id="button" className="my-5 flex w-full flex-col">
          <button type="submit" className="w-full rounded-lg bg-green-600 py-4 text-green-100">
            <div className="flex flex-row items-center justify-center">
              <div className="mr-2">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  ></path>
                </svg>
              </div>
              <div className="font-bold">Sign In</div>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
