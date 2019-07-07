import React from "react";
import { Table } from "reactstrap";
import TimesheetEntry from "./TimesheetEntry";

export default () => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Datum</th>
          <th>Anfang</th>
          <th>Ende</th>
          <th>Pause in Minuten</th>
          <th>Bemerkungen</th>
        </tr>
      </thead>
      <tbody>
        <TimesheetEntry
          date="01.03.2019"
          start="8:00"
          end="16:00"
          breakMinutes="30"
          info="CoreData"
        />
      </tbody>
    </Table>
  );
};
