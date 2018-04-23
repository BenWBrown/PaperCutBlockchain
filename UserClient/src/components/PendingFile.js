import React from 'react';
import { Button } from 'react-bootstrap';

function PendingFile(props) {
  return (
    <div>
      <p>{props.filename}</p>
      <p>Status: {props.status}</p>
      <p>Cost: {props.cost || ''}</p>
      {props.status === 'Printed' ?
        <Button onClick={() => props.onRemove()}>Remove</Button> :
        <Button onClick={() => props.onCancel()}>Cancel</Button>}
    </div>
  )
}

export default PendingFile;
