import firebase from "firebase";
import React from "react";
import { Button, Input, DatePicker, Row, Form } from "antd";
import { FormFeedback, FormGroup, Label } from "reactstrap";
import SubmitSuccessModal from "../Helpers/SubmitSuccessModal";
import "./Main.scss";
import DateUtil from "../../util/DateUtil";
import moment from "moment";

export default class Main extends React.Component {
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
      currentUser: undefined,
      downloadUrl: undefined
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
      .then(() => {
        this.setDownloadUrl();
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

  onEntryIdChanged(event) {
    const newId = event.target.value;
    this.setState({ id: newId });
    this.fetchEntry(newId);
  }

  onDateStartChanged(event) {
    this.setState({
      dateStart: moment(event.target.value, ["YYYY-MM-DD"])
    });
  }

  onDateEndChanged(event) {
    this.setState({ dateEnd: moment(event.target.value, ["YYYY-MM-DD"]) });
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

  setDownloadUrl() {
    this.userRef
      .get()
      .then(snapshot => snapshot.data())
      .then(data => {
        const name = encodeURI(data.name);
        const betrieb = encodeURI(data.betrieb);
        const ausbilder = encodeURI(data.ausbilder);
        const abteilung = encodeURI(data.abteilung);
        const projekt = encodeURI(data.projekt);
        const bericht_von = this.state.dateStart.format(this.datePattern);
        const bericht_bis = this.state.dateEnd.format(this.datePattern);
        const nachweisnr = this.state.id;
        const kalenderwoche = DateUtil.getCalendarWeek(bericht_von);
        const ausbildungs_jahr = DateUtil.getCurrentYearAfterDate(
          data.ausbildungsanfang,
          bericht_von
        );
        const taetigkeiten = encodeURI(this.state.activities);
        const schulungen = encodeURI(this.state.instructions);
        const schule = encodeURI(this.state.school);
        const stadt = encodeURI(data.stadt);
        this.setState({
          downloadUrl: `https://us-central1-ausbildungs-planer.cloudfunctions.net/exportToDocx?name=${name}&betrieb=${betrieb}&ausbilder=${ausbilder}&abteilung=${abteilung}&projekt=${projekt}&bericht_von=${bericht_von}&bericht_bis=${bericht_bis}&nachweisnr=${nachweisnr}&kalenderwoche=${kalenderwoche}&ausbildungs_jahr=${ausbildungs_jahr}&taetigkeiten=${taetigkeiten}&schulungen=${schulungen}&schule=${schule}&stadt=${stadt}`
        });
      });
  }

  render() {
    return (
      <div id="main">
        <Form.Item label="Berichtsnummer">
          <Input
            type="number"
            valid={this.state.isNewEntry}
            onChange={this.onEntryIdChanged.bind(this)}
            value={this.state.id || ""}
          />
          <FormFeedback valid={this.state.isNewEntry}>
            Das ist ein neuer Bericht!
          </FormFeedback>
        </Form.Item>
        <Form.Item label="Woche">
          <DatePicker.RangePicker
            label="Woche"
            value={[this.state.dateStart, this.state.dateEnd]}
          />
        </Form.Item>
        <FormGroup>
          <Label for="activities">Betriebliche Tätigkeiten</Label>
          <Input.TextArea
            type="textarea"
            name="activities"
            id="activities"
            className="textField"
            autosize
            onChange={this.onActivityChanged.bind(this)}
            value={this.state.activities}
          />
        </FormGroup>
        <FormGroup>
          <Label for="instructions">Schulungen</Label>
          <Input.TextArea
            type="textarea"
            name="instructions"
            id="instructions"
            className="textField"
            autosize
            onChange={this.onInstructionsChanged.bind(this)}
            value={this.state.instructions}
          />
        </FormGroup>
        <FormGroup>
          <Label for="school">Berufsschule</Label>
          <Input.TextArea
            type="textarea"
            name="school"
            id="school"
            className="textField"
            autosize
            onChange={this.onSchoolChanged.bind(this)}
            value={this.state.school}
          />
        </FormGroup>
        <FormGroup>
          <Button
            loading={this.state.submitButtonDisabled}
            type="primary"
            onClick={this.onSubmit.bind(this)}
          >
            Submit
          </Button>
          <Button
            className="ml-1"
            type="info"
            icon="download"
            href={this.state.downloadUrl}
          >
            Download als Docx
          </Button>
        </FormGroup>

        <SubmitSuccessModal
          toggle={this.toggleSuccessModal.bind(this)}
          isOpen={this.state.successModalVisible}
        />
      </div>
    );
  }
}
