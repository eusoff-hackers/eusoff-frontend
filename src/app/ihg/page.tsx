"use client";

import React, { useEffect, useState } from "react";

import { CircularProgress } from "@mui/material";
// Import the Image component from next/image
import axios from "axios";
import Image from "next/image";

// Import axios

export interface Match {
  red: { _id: string; name: string };
  blue: { _id: string; name: string };
  sport: { name: string; isCarnival: boolean };
  timestamp: number;
  venue: string;
  stage: string;
}

export interface Point {
  hall: { id: string; name: string };
  points: number;
  golds: number;
  silvers: number;
  bronzes: number;
}

const sortMatchesByTimestamp = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => a.timestamp - b.timestamp);
};

function getCapitalLetters(word: string): string {
  return word.match(/[A-Z]/g)?.join("") || "";
}

const Leaderboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<number>(parseInt(localStorage.getItem("lastFetchTime") || "0"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchesResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ihg/matches`);

        if (matchesResponse.data.success) {
          const sortedMatches = sortMatchesByTimestamp(matchesResponse.data.data);
          setMatches(sortedMatches);
          localStorage.setItem("matches", JSON.stringify(sortedMatches));
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      }

      try {
        const pointsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ihg/points`);

        if (pointsResponse.data.success) {
          setPoints(pointsResponse.data.data);
          localStorage.setItem("points", JSON.stringify(pointsResponse.data.data));
        }
      } catch (error) {
        console.error("Error fetching points:", error);
      }

      setLastFetchTime(Date.now());
      localStorage.setItem("lastFetchTime", Date.now().toString());
      setLoading(false);
    };

    if (!points.length || !matches.length || Date.now() - lastFetchTime > 5 * 60 * 1000) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [lastFetchTime, matches.length, points.length]);

  const getTime = (timestamp: number) => {
    const time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp);

    return time;
  };

  const formatDateToOrdinal = (dateString: string) => {
    const [day, month] = dateString.split("/");

    const dayWithOrdinal = addOrdinalSuffix(parseInt(day, 10));
    const monthName = getMonthName(parseInt(month, 10) - 1); // Month is zero-based in JavaScript Date object

    return `${dayWithOrdinal} ${monthName}`;
  };

  const addOrdinalSuffix = (number: number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = number % 100;
    return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  const getDate = (timestamp: number) => {
    const time = new Intl.DateTimeFormat("en-GB", {
      month: "2-digit",
      day: "2-digit",
    }).format(timestamp);

    return formatDateToOrdinal(time);
  };

  const convertTo12HourFormat = (time24hr: string): string => {
    const [hours, minutes] = time24hr.split(":");
    let period = "AM";

    let hours12 = parseInt(hours, 10);
    if (hours12 >= 12) {
      period = "PM";
      if (hours12 > 12) {
        hours12 -= 12;
      }
    }

    const formattedTime = `${hours12}:${minutes} ${period}`;
    return formattedTime;
  };

  const generateTable = (pointsArray: Point[]) => {
    return (
      <div className="tableContainer">
        <div className="headerRow">
          <p className="headerCell">Hall Name</p>
          <p className="headerCell">🥇</p>
          <p className="headerCell">🥈</p>
          <p className="headerCell">🥉</p>
          <p className="headerCell">Points</p>
        </div>
        {pointsArray.map(row => (
          <div className="contentRow" key={row.hall.id}>
            <p className="tableCell">{row.hall.name}</p>
            <p className="tableCell">{row.golds}</p>
            <p className="tableCell">{row.silvers}</p>
            <p className="tableCell">{row.bronzes}</p>
            <p className="tableCell">{row.points}</p>
          </div>
        ))}
      </div>
    );
  };

  let heading = ""; // Move heading inside the component scope

  return loading ? (
    <div className="loadingContainer">
      <p>LOADING</p>
      <CircularProgress />
    </div>
  ) : (
    <div className="container">
      <div className="header">
        <div className="left">
          <Image className="eusoff" alt="eusoffLogo" src="/path/to/eusoffLogo.png" />
          <div className="text">
            <h1>Eusoff Hall</h1>
            <h5>Excellence and Glory</h5>
          </div>
        </div>
        <div className="right">
          <h1> Inter Hall Games-23/24</h1>
        </div>
      </div>
      <div className="content">
        <div className="leaderboard">
          <h1> Leaderboard</h1>
          {generateTable(points)}
        </div>
        <div className="matches">
          <h1> Upcoming Matches </h1>
          {matches != null &&
            matches.map((match, index) => {
              const formattedDate = getDate(match.timestamp);
              const time = getTime(match.timestamp);

              const renderHeading = heading !== formattedDate;
              heading = formattedDate;

              return (
                <>
                  {renderHeading && <h2 className="date">{formattedDate}</h2>}
                  <div className="matchContainer" key={index}>
                    <div className="hallvs">
                      <div className="logoContainer">
                        <Image
                          className="hallLogo"
                          alt="hall logo"
                          width={100}
                          height={100}
                          src={`/${match.red.name.replace(/\s+/g, "")}.png`}
                        />
                        <span className="hallNameSmall">{getCapitalLetters(match.red.name.replace(/\s+/g, ""))}</span>
                      </div>
                      <span className="versus">VS</span>
                      <div className="logoContainer">
                        <Image
                          className="hallLogo"
                          alt="hall logo"
                          width={100}
                          height={100}
                          src={`/${match.blue.name.replace(/\s+/g, "")}.png`}
                        />
                        <span className="hallNameSmall">{getCapitalLetters(match.blue.name.replace(/\s+/g, ""))}</span>
                      </div>
                    </div>
                    <div className="sportName">
                      <span>
                        {match.sport.name} - {match.stage}
                      </span>
                      <span className="venue">{match.venue}</span>
                    </div>
                    <div className="timing">
                      <span>{convertTo12HourFormat(time)}</span>
                    </div>
                  </div>
                </>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
