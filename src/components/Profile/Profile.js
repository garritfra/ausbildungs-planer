import React from "react";
import { Container, Form, FormGroup, Label, Input, Button } from "reactstrap";
import firebase from "firebase";

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      currentUser: null,
      name: "",
      betrieb: "",
      abteilung: "",
      projekt: "",
      ausbilder: "",
      ausbildungsanfang: "",
      ausbildungsende: ""
    };
    this.userRef = null;
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ currentUser: user });
      this.fetchData();
    });
  }

  fetchData() {
    this.userRef = firebase
      .firestore()
      .collection("Users")
      .doc(this.state.currentUser.email.toString());

    this.userRef
      .get()
      .then(snapshot => snapshot.data())
      .then(user => {
        this.setState({ ...user });
      });
  }

  updateData() {
    this.userRef
      .update({
        name: this.state.name,
        betrieb: this.state.betrieb,
        abteilung: this.state.abteilung,
        projekt: this.state.projekt,
        ausbilder: this.state.ausbilder,
        ausbildungsanfang: this.state.ausbildungsanfang,
        ausbildungsende: this.state.ausbildungsende
      })
      .then(() => {
        console.log("Success!");
      })
      .catch(err => console.log(err));
  }

  onNameChanged(event) {
    this.setState({ name: event.target.value });
    console.log(this.state);
  }

  onBetriebChanged(event) {
    this.setState({ betrieb: event.target.value });
  }

  onAbteilungChanged(event) {
    this.setState({ abteilung: event.target.value });
  }

  onProjektChanged(event) {
    this.setState({ projekt: event.target.value });
  }

  onAusbilderChanged(event) {
    this.setState({ ausbilder: event.target.value });
  }

  onAusbildungsanfangChanged(event) {
    this.setState({ ausbildungsanfang: event.target.value });
  }

  onAusbildungsendeChanged(event) {
    this.setState({ ausbildungsende: event.target.value });
  }

  render() {
    return (
      <Container className="mt-5">
        <Form>
          <FormGroup>
            <Label for="name">Name</Label>
            <Input
              type="text"
              defaultValue="Placeholder"
              placeholder="Name"
              value={this.state.name}
              onChange={this.onNameChanged.bind(this)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="betrieb">Betrieb</Label>
            <Input
              type="text"
              placeholder="Betrieb"
              value={this.state.betrieb}
              onChange={this.onBetriebChanged.bind(this)}
            />
          </FormGroup>

          <FormGroup>
            <Label for="abteilung">Abteilung</Label>
            <Input
              type="text"
              placeholder="Abteilung"
              value={this.state.abteilung}
              onChange={this.onAbteilungChanged.bind(this)}
            />
          </FormGroup>

          <FormGroup>
            <Label for="projekt">Projekt</Label>
            <Input
              type="text"
              placeholder="Projekt"
              value={this.state.projekt}
              onChange={this.onProjektChanged.bind(this)}
            />
          </FormGroup>

          <FormGroup>
            <Label for="ausbilder">Ausbilder</Label>
            <Input
              type="text"
              placeholder="Ausbilder"
              value={this.state.ausbilder}
              onChange={this.onAusbilderChanged.bind(this)}
            />
          </FormGroup>

          <FormGroup>
            <Label for="ausbildungsanfang">Anfang der Ausbildung</Label>
            <Input
              type="date"
              placeholder="Anfang der Ausbildung"
              value={this.state.ausbildungsanfang}
              onChange={this.onAusbildungsanfangChanged.bind(this)}
            />
          </FormGroup>

          <FormGroup>
            <Label for="ausbildungsende">Ende der Ausbildung</Label>
            <Input
              type="date"
              placeholder="Ende der Ausbildung"
              value={this.state.ausbildungsende}
              onChange={this.onAusbildungsendeChanged.bind(this)}
            />
          </FormGroup>

          <Button color="primary" onClick={this.updateData.bind(this)}>
            Submit
          </Button>
        </Form>
      </Container>
    );
  }
}
