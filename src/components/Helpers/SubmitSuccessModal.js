import React from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";

export default class SubmitSuccessModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal toggle={this.props.toggle} isOpen={this.props.isOpen}>
        <ModalHeader>Success!</ModalHeader>
        <ModalBody>
          <Button onClick={this.props.toggle}>Close</Button>
        </ModalBody>
      </Modal>
    );
  }
}
