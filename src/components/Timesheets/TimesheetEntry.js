import React from "react";
import { Table } from "reactstrap";

export default ({ date, start, end, breakMinutes, info }) => {
  return (
    <tr>
      <td>{date}</td>
      <td>{start}</td>
      <td>{end}</td>
      <td>{breakMinutes}</td>
      <td>{info}</td>
    </tr>
  );
};
