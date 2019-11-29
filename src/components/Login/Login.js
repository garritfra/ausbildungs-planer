import auth from "firebase/auth";
import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const uiConfig = {
      // Popup signin flow rather than redirect flow.
      signInFlow: "redirect",
      // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
      signInSuccessUrl: "/",
      // We will display Google and Facebook as auth providers.
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
    };

    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth()} />;
  }
}
