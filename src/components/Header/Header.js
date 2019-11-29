import auth from "firebase/auth";
import React from "react";
import {
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink
} from "reactstrap";
import "./Header.scss";
import FeatureManager from "../../util/FeatureManager";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      isOpen: false,
      user: undefined,
      isLoggedIn: false,
      timesheetsEnabled: false
    };
  }

  componentDidMount() {
    auth().onAuthStateChanged(user => {
      this.setState({ user: user, isLoggedIn: !!user });
    });

    FeatureManager.instance.timesheetsEnabled.subscribe({
      next: v => this.setState({ timesheetsEnabled: v })
    });
  }

  toggleHamburger() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    return (
      <div id="header">
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">Der Ausbildungsplaner</NavbarBrand>
          <NavbarToggler onClick={this.toggleHamburger.bind(this)} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {this.state.timesheetsEnabled && (
                <NavItem hidden={!this.state.isLoggedIn}>
                  <NavLink href="/berichte">Berichtshefte</NavLink>
                </NavItem>
              )}
              {this.state.timesheetsEnabled && (
                <NavItem hidden={!this.state.isLoggedIn}>
                  <NavLink href="/timesheets">Timesheets</NavLink>
                </NavItem>
              )}
              <NavItem>
                <NavLink href={this.state.isLoggedIn ? "/profile" : "/login"}>
                  {this.state.isLoggedIn
                    ? this.state.user.displayName
                    : "Login"}
                </NavLink>
              </NavItem>
              <NavItem hidden={!this.state.isLoggedIn}>
                <NavLink href="/" onClick={() => auth().signOut()}>
                  Log Out
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
