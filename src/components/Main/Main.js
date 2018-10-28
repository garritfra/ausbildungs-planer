import firebase from "firebase";
import React from "react";
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label
} from "reactstrap";
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
      id: null,
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
        this.setState({
          downloadUrl: `https://us-central1-ausbildungs-planer.cloudfunctions.net/exportToDocx?name=${name}&betrieb=${betrieb}&ausbilder=${ausbilder}&abteilung=${abteilung}&projekt=${projekt}&bericht_von=${bericht_von}&bericht_bis=${bericht_bis}&nachweisnr=${nachweisnr}&kalenderwoche=${kalenderwoche}&ausbildungs_jahr=${ausbildungs_jahr}&taetigkeiten=${taetigkeiten}&schulungen=${schulungen}&schule=${schule}`
        });
      });
  }

  render() {
    return (
      <div id="main">
        <Form className="left">
          <FormGroup>
            <Label for="activities">Betriebliche Tätigkeiten</Label>
            <Input
              type="textarea"
              name="activities"
              id="activities"
              className="textField"
              onChange={this.onActivityChanged.bind(this)}
              value={this.state.activities}
            />
          </FormGroup>
          <FormGroup>
            <Label for="instructions">Schulungen</Label>
            <Input
              type="textarea"
              name="instructions"
              id="instructions"
              className="textField"
              onChange={this.onInstructionsChanged.bind(this)}
              value={this.state.instructions}
            />
          </FormGroup>
          <FormGroup>
            <Label for="school">Berufsschule</Label>
            <Input
              type="textarea"
              name="school"
              id="school"
              className="textField"
              onChange={this.onSchoolChanged.bind(this)}
              value={this.state.school}
            />
          </FormGroup>
          <FormGroup>
            <Button
              disabled={this.state.submitButtonDisabled}
              color="primary"
              onClick={this.onSubmit.bind(this)}
            >
              Submit
            </Button>
            <Button className="ml-1" color="info" href={this.state.downloadUrl}>
              Download als Docx
            </Button>
          </FormGroup>
        </Form>
        <Form className="right">
          <FormGroup>
            <Label for="number">Berichtsnummer</Label>
            <Input
              valid={this.state.isNewEntry}
              onChange={this.onEntryIdChanged.bind(this)}
              id="number"
              type="number"
              value={this.state.id || ""}
            />
            <FormFeedback valid={this.state.isNewEntry}>
              Das ist ein neuer Bericht!
            </FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="dateStart">Woche von</Label>
            <Input
              onChange={this.onDateStartChanged.bind(this)}
              type="date"
              value={this.state.dateStart.format("YYYY-MM-DD") || ""}
            />
          </FormGroup>
          <FormGroup>
            <Label for="dateEnd">bis</Label>
            <Input
              onChange={this.onDateEndChanged.bind(this)}
              type="date"
              value={this.state.dateEnd.format("YYYY-MM-DD") || ""}
            />
          </FormGroup>
        </Form>
        <SubmitSuccessModal
          toggle={this.toggleSuccessModal.bind(this)}
          isOpen={this.state.successModalVisible}
        />
      </div>
    );
  }
}
