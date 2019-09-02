import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Collapse,
  Jumbotron,
  Input,
  Form,
  FormGroup,
  Label
} from "reactstrap";
import DatePicker from "antd/lib/date-picker";
import TimesheetEntry from "./TimesheetEntry";
import firebase from "firebase";
import DateUtil from "../../util/DateUtil";
import moment from "moment";

export default () => {
  const [timesheets, setTimesheets] = useState([]);
  const [newTimesheet, setNewTimesheet] = useState({
    date: moment(),
    start: moment(),
    end: moment(),
    breakMinutes: 30,
    info: ""
  });
  const [newEntryOpen, setNewEntryOpen] = useState(false);

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

  const submitEntry = async () => {
    let result = await firebase
      .app()
      .functions("us-central1")
      .httpsCallable("addTimesheet")({
      date: newTimesheet.date.format("DD.MM.YYYY"),
      start: newTimesheet.start.format("HH:mm"),
      end: newTimesheet.end.format("HH:mm"),
      breakMinutes: newTimesheet.breakMinutes,
      activities: newTimesheet.info
    });

    console.log(result.data);
    document.location.reload();
  };

  return (
    <div>
      <Button
        color="primary"
        style={{ margin: "1em" }}
        onClick={() => {
          setNewEntryOpen(!newEntryOpen);
        }}
      >
        Neuer Eintrag
      </Button>
      <Collapse isOpen={newEntryOpen}>
        <Jumbotron>
          <Form>
            <FormGroup>
              <Label>Datum</Label>
              <Input
                type="date"
                value={newTimesheet.date.format("YYYY-MM-DD")}
                onChange={event => {
                  console.log(event.target.value);
                  setNewTimesheet({
                    ...newTimesheet,
                    date: moment(event.target.value)
                  });
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label>Anfang der Arbeitszeit</Label>
              <Input
                type="time"
                onChange={event => {
                  setNewTimesheet({
                    ...newTimesheet,
                    start: moment(event.target.value, ["HH:mm"])
                  });
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label>Ende der Arbeitszeit</Label>
              <Input
                type="time"
                onChange={event => {
                  setNewTimesheet({
                    ...newTimesheet,
                    end: moment(event.target.value, ["HH:mm"])
                  });
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label>Pause in Minuten: {newTimesheet.breakMinutes}</Label>
              <Input
                type="range"
                min={0}
                max={180}
                step={15}
                value={newTimesheet.breakMinutes}
                onChange={event => {
                  setNewTimesheet({
                    ...newTimesheet,
                    breakMinutes: Number(event.target.value)
                  });
                  console.log(newTimesheet);
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label>Bemerkungen</Label>
              <Input
                type="text"
                onChange={event => {
                  setNewTimesheet({
                    ...newTimesheet,
                    info: event.target.value
                  });
                }}
              />
            </FormGroup>
          </Form>
          <Button onClick={() => submitEntry()}>Abschicken!</Button>
        </Jumbotron>
      </Collapse>
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
