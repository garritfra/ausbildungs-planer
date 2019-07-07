import React from "react";
import { Table, Button } from "reactstrap";
import { Icon } from "antd";

export default ({ date, start, end, breakMinutes, info }) => {
  return (
    <tr onClick={() => alert(date)}>
      <td>
        <Button size="sm">
          <Icon type="edit" />
        </Button>
      </td>
      <td>{date}</td>
      <td>{start}</td>
      <td>{end}</td>
      <td>{breakMinutes}</td>
      <td>{info}</td>
    </tr>
  );
};
