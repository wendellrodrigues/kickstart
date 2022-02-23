import React, { useState } from "react";
import { Table, Button } from "semantic-ui-react";
import web3 from "../ethereum/web3";
import Campaign from "../ethereum/campaign";

const RequestRow = ({ id, request, address, approversCount }) => {
  //Destructure
  const { Row, Cell } = Table;
  const { description, value, recipient, approvalCount, complete } = request;

  const [errorMessage, setErrorMessage] = useState("");
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingFinalize, setLoadingFinalize] = useState(false);

  //Ready to finalize
  const readyToFinalize = approvalCount > approversCount / 2;

  //Approve Request
  const onApprove = async () => {
    const campaign = Campaign(address);
    setLoadingApprove(true);
    setErrorMessage("");
    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.approveRequest(id).send({
        from: accounts[0],
      });
      Router.replaceRoute(`/campaigns/${address}/requests`);
    } catch (error) {
      setErrorMessage(error.message);
    }
    setLoadingApprove(false);
  };

  //Finalize Request
  const onFinalize = async () => {
    const campaign = Campaign(address);
    setLoadingFinalize(true);
    setErrorMessage("");
    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.finalizeRequest(id).send({
        from: accounts[0],
      });
      Router.replaceRoute(`/campaigns/${address}/requests`);
    } catch (error) {
      setErrorMessage(error.message);
    }
    setLoadingFinalize(false);
  };

  return (
    <Row disabled={complete} positive={readyToFinalize && !complete}>
      <Cell>{id}</Cell>
      <Cell>{description}</Cell>
      <Cell>{web3.utils.fromWei(value, "ether")}</Cell>
      <Cell>{recipient}</Cell>
      <Cell>
        {approvalCount}/{approversCount}
      </Cell>
      <Cell>
        {complete ? (
          <p>completed</p>
        ) : (
          <Button
            color="green"
            basic={readyToFinalize ? true : false}
            onClick={onApprove}
            loading={loadingApprove}
          >
            Approve
          </Button>
        )}
      </Cell>
      <Cell>
        {complete ? (
          <p>completed</p>
        ) : readyToFinalize ? (
          <Button color="teal" onClick={onFinalize} loading={loadingFinalize}>
            Finalize
          </Button>
        ) : null}
      </Cell>
    </Row>
  );
};

export default RequestRow;
