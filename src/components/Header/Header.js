import React from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import "./Header.scss";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = { isOpen: false };
  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    return (
      <div id="header">
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">Der Ausbildungsplaner</NavbarBrand>
          <NavbarToggler onClick={this.toggle.bind(this)} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/new">Neu</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/reports">Alle Berichte</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
