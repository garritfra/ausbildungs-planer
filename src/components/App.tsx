import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "../styles/app.scss";
import Header from "./Header/Header";
import Login from "./Login/Login";
import Main from "./Main/Main";

interface IAppProps {}

interface IAppState {}

export default class App extends React.Component<IAppProps, IAppState> {
  props: IAppProps;

  constructor(props: IAppProps) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <Router>
        <div className="app">
          <Header />
          <Route exact path="/" component={Main} />
          <Route path="/login" component={Login} />
        </div>
      </Router>
    );
  }
}
