import firestore from "firebase/firestore";
import auth from "firebase/auth";
import storage from "firebase/storage";
import app from "firebase/app";
import performance from "firebase/performance";
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
import CacheProvider from "../../util/CacheProvider";

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
    auth().onAuthStateChanged(user => {
      if (user != undefined) {
        console.log("User: " + user);
        this.setState({ currentUser: user });
        this.initializeFirebaseRefs();

        let fetch = async () => {
          let cachedId = await CacheProvider.instance.get("last_bericht_id");

          console.log("fetching cached id " + cachedId);

          let document = await this.entriesRef.doc(String(cachedId)).get();
          let data = await document.data();
          console.log(data);
          this.setState({ id: data.id });
          this.fetchEntry(data.id);
        };

        fetch();
      }
    });
  }

  initializeFirebaseRefs() {
    this.userRef = firestore()
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
    let submitEntryTrace = performance().trace("submitEntry");
    submitEntryTrace.start();

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
        submitEntryTrace.stop();
      })
      .catch(err => {
        this.enableSubmitButton();
      });
  }

  fetchEntry(id) {
    const fetchEntryTrace = performance().trace("fetchEntry");
    fetchEntryTrace.start();
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
        fetchEntryTrace.stop();
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
    console.log(value);
    const newId = value;
    this.setState({ id: newId });
    this.fetchEntry(newId);
    CacheProvider.instance.set("last_bericht_id", value);
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
        app()
          .functions("us-central1")
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
            return storage()
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
