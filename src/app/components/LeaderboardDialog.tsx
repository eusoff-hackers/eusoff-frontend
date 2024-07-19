import React, { useState } from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";

export interface bidderInfo {
  user: {
    username: string;
    role: string;
    year: number;
    gender: string;
    room: string;
  };
  info: {
    isEligible: boolean;
    points: number;
  };
}

export interface lbProps {
  data: bidderInfo[];
}

const LeaderboardDialog: React.FC<lbProps> = ({ data }) => {
  const [open, setOpen] = useState(false);

  console.log(data);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="w-full">
      <h1 className="border-b-2 border-b-slate-400 text-2xl text-black">Block LeaderBoard</h1>

      <TableContainer component={Paper} style={{ overflow: "auto" }}>
        <Table stickyHeader aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Room Number</TableCell>
              <TableCell align="right">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.user.room} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell>{row.user.room.replace(/EH|\s|\/.*?\//g, "")}</TableCell>
                <TableCell align="right">{row.info.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default LeaderboardDialog;
