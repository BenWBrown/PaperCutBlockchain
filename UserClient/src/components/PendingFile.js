import React from 'react';
import { Button } from 'react-bootstrap';

function PendingFile(props) {
  return (
    <div>
      <p>{props.filename}</p>
      <p>Status: {props.status}</p>
      <p>Cost: {props.cost || ''}</p>
      {props.status === 'Printed' ?
        <Button onClick={() => props.onRemove(props.filehash)}>Remove</Button> :
        <Button onClick={() => props.onCancel(props.filehash)}>Cancel</Button>}
    </div>
  )
}

export default PendingFile;
