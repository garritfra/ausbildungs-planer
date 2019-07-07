import React, { useEffect, useState } from "react";
import { Table, Button } from "reactstrap";
import TimesheetEntry from "./TimesheetEntry";
import firebase from "firebase";

export default () => {
  const [timesheets, setTimesheets] = useState([]);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    const user = firebase.auth().currentUser;
    const timesheetsRef = await firebase
      .firestore()
      .collection("Users")
      .doc(user.email)
      .collection("Zeiterfassung")
      .get();

    const data = timesheetsRef.docs.map(snapshot => {
      return { ...snapshot.data(), date: snapshot.id };
    });
    console.log(data);
    setTimesheets(data);
  };

  const timesheetsComponents = timesheets.map(timesheet => (
    <TimesheetEntry
      key={timesheet.date}
      date={timesheet.date}
      start={timesheet.beginn}
      end={timesheet.ende}
      breakMinutes={timesheet.pauseMinuten}
      info={timesheet.taetigkeiten}
    />
  ));

  return (
    <div>
      <Button color="primary" style={{ margin: "1em" }}>
        Neuer Eintrag
      </Button>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Edit</th>
            <th>Datum</th>
            <th>Anfang</th>
            <th>Ende</th>
            <th>Pause</th>
            <th>Bemerkungen</th>
          </tr>
        </thead>
        <tbody>{timesheetsComponents}</tbody>
      </Table>
    </div>
  );
};
