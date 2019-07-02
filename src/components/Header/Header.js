import firebase from "firebase";
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

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      isOpen: false,
      user: undefined,
      isLoggedIn: false
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user: user, isLoggedIn: !!user });
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
              <NavItem>
                <NavLink href={this.state.isLoggedIn ? "/profile" : "/login"}>
                  {this.state.isLoggedIn
                    ? this.state.user.displayName
                    : "Login"}
                </NavLink>
              </NavItem>
              <NavItem hidden={!this.state.isLoggedIn}>
                <NavLink href="/" onClick={() => firebase.auth().signOut()}>
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
