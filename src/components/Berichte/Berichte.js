import firebase, { functions } from "firebase";
import React from "react";
import {
  Button,
  Input,
  DatePicker,
  InputNumber,
  Form,
  Tooltip,
  Alert
} from "antd";

import { Col, Row } from "reactstrap";
import SubmitSuccessModal from "../Helpers/SubmitSuccessModal";
import "./Berichte.scss";
import DateUtil from "../../util/DateUtil";
import moment from "moment";

export default class Berichte extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.datePattern = "DD.MM.YYYY";

    this.state = {
      id: 1,
      activities: "",
      instructions: "",
      school: "",
      dateStart: moment(),
      dateEnd: moment(),
      successModalVisible: false,
      isNewEntry: true,
      submitButtonDisabled: false,
      currentUser: undefined
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ currentUser: user });
      this.initializeFirebaseRefs();

      this.entriesRef
        .orderBy("id", "desc")
        .limit(1)
        .get()
        .then(entry => entry.docs[0].data())
        .then(data => this.setState({ id: data.id }))
        .then(() => this.fetchEntry(this.state.id));
    });
  }

  initializeFirebaseRefs() {
    this.userRef = firebase
      .firestore()
      .collection("Users")
      .doc(this.state.currentUser.email);
    this.entriesRef = this.userRef.collection("Berichte");
  }

  enableSubmitButton() {
    this.setState({ submitButtonDisabled: false });
  }

  disableSubmitButton() {
    this.setState({ submitButtonDisabled: true });
  }

  onSubmit() {
    this.disableSubmitButton();
    const newBericht = {
      id: this.state.id,
      activities: this.state.activities,
      instructions: this.state.instructions,
      school: this.state.school,
      dateStart: this.state.dateStart.format(this.datePattern),
      dateEnd: this.state.dateEnd.format(this.datePattern)
    };
    this.entriesRef
      .doc(this.state.id.toString())
      .set(newBericht)
      .then(() => {
        this.toggleSuccessModal();
        this.enableSubmitButton();
        this.fetchEntry(this.state.id.toString());
      })
      .catch(err => {
        this.enableSubmitButton();
      });
  }

  fetchEntry(id) {
    this.disableSubmitButton();
    this.entriesRef
      .doc(id.toString())
      .get()
      .then(snapshot => snapshot.data())
      .then(newBericht => {
        this.setState({
          activities: newBericht.activities,
          instructions: newBericht.instructions,
          school: newBericht.school,
          dateStart: moment(newBericht.dateStart, [this.datePattern]),
          dateEnd: moment(newBericht.dateEnd, [this.datePattern]),
          isNewEntry: false
        });
        this.enableSubmitButton();
      })
      .catch(err => {
        this.onNoEntryFound();
        this.enableSubmitButton();
      });
  }

  onActivityChanged(event) {
    this.setState({ activities: event.target.value });
  }

  onInstructionsChanged(event) {
    this.setState({ instructions: event.target.value });
  }

  onSchoolChanged(event) {
    this.setState({ school: event.target.value });
  }

  onEntryIdChanged(value) {
    const newId = value;
    this.setState({ id: newId });
    this.fetchEntry(newId);
  }

  onDateRangeChanged(dates) {
    this.setState({ dateStart: dates[0], dateEnd: dates[1] });
  }

  onNoEntryFound() {
    this.setState({
      activities: "",
      instructions: "",
      school: "",
      isNewEntry: true
    });
  }

  toggleSuccessModal() {
    this.setState({ successModalVisible: !this.state.successModalVisible });
  }

  downloadDoc() {
    this.userRef
      .get()
      .then(snapshot => snapshot.data())
      .then(data => {
        functions()
          .httpsCallable("exportToDocx")({
            name: data.name,
            betrieb: data.betrieb,
            ausbilder: data.ausbilder,
            abteilung: data.abteilung,
            projekt: data.projekt,
            bericht_von: this.state.dateStart.format(this.datePattern),
            bericht_bis: this.state.dateEnd.format(this.datePattern),
            nachweisnr: this.state.id,
            kalenderwoche: DateUtil.getCalendarWeek(this.state.dateStart),
            ausbildungs_jahr: DateUtil.getCurrentYearAfterDate(
              data.ausbildungsanfang,
              this.state.dateStart
            ),
            taetigkeiten: this.state.activities,
            schulungen: this.state.instructions,
            schule: this.state.school,
            stadt: data.stadt
          })
          .then(data => {
            return data.data;
          })
          .then(fileName => {
            console.log(fileName);
            return firebase
              .storage()
              .ref(fileName)
              .getDownloadURL();
          })
          .then(downloadURL => {
            console.log(downloadURL);
            window.location.replace(downloadURL);
          });
      });
  }

  render() {
    return (
      <div id="main">
        {this.state.currentUser == undefined ? (
          <Alert
            message="Melde dich an, um Berichte zu schreiben und zu speichern. Ich arbeite daran, den Download von Berichten auch ohne Account zu ermöglichen! :)"
            type="error"
          />
        ) : null}
        <Row>
          <Col>
            <Form.Item>
              <p>Berichtsnummer</p>
              <Tooltip
                placement="right"
                visible={
                  this.state.isNewEntry && this.state.currentUser != undefined
                }
                title="Das ist ein neuer Bericht!"
              >
                <InputNumber
                  valid={this.state.isNewEntry}
                  onChange={this.onEntryIdChanged.bind(this)}
                  min={1}
                  value={this.state.id || ""}
                />
              </Tooltip>
            </Form.Item>
            <Form.Item>
              <p>Woche</p>
              <DatePicker.RangePicker
                label="Woche"
                format={this.datePattern}
                value={[this.state.dateStart, this.state.dateEnd]}
                onChange={this.onDateRangeChanged.bind(this)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xl>
            <Form.Item>
              <h4 for="activities">Betriebliche Tätigkeiten</h4>
              <Input.TextArea
                type="textarea"
                name="activities"
                id="activities"
                className="textField"
                autosize
                onChange={this.onActivityChanged.bind(this)}
                value={this.state.activities}
              />
            </Form.Item>
          </Col>
          <Col xl>
            <Form.Item>
              <h4 for="instructions">Schulungen</h4>
              <Input.TextArea
                type="textarea"
                name="instructions"
                id="instructions"
                className="textField"
                autosize
                onChange={this.onInstructionsChanged.bind(this)}
                value={this.state.instructions}
              />
            </Form.Item>
          </Col>
          <Col xl>
            <Form.Item>
              <h4 for="school">Berufsschule</h4>
              <Input.TextArea
                type="textarea"
                name="school"
                id="school"
                className="textField"
                autosize
                onChange={this.onSchoolChanged.bind(this)}
                value={this.state.school}
              />
            </Form.Item>
          </Col>
        </Row>
        <Button
          loading={this.state.submitButtonDisabled}
          type="primary"
          onClick={this.onSubmit.bind(this)}
        >
          Submit
        </Button>
        <Tooltip title="Falls nichts passiert, überprüfe bitte deine Daten deines Profils">
          <Button
            className="ml-1"
            type="info"
            icon="download"
            onClick={this.downloadDoc.bind(this)}
          >
            Download als Docx
          </Button>
        </Tooltip>

        <SubmitSuccessModal
          toggle={this.toggleSuccessModal.bind(this)}
          isOpen={this.state.successModalVisible}
        />
      </div>
    );
  }
}