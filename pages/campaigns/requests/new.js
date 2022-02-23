import React, { useState } from "react";
import { Button, Form, Message, Input } from "semantic-ui-react";
import { Link, Router } from "../../../routes";
import Layout from "../../../components/Layout";
import web3 from "../../../ethereum/web3";
import Campaign from "../../../ethereum/Campaign";

const RequestNew = ({ address }) => {
  //State
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  //Submit Request
  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const campaign = Campaign(address);
    try {
      const accounts = await web3.eth.getAccounts();
      const weiValue = web3.utils.toWei(value, "ether");
      await campaign.methods
        .createRequest(description, weiValue, recipient)
        .send({
          from: accounts[0],
        });
      Router.pushRoute(`/campaigns/${address}/requests`);
    } catch (error) {
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Link route={`/campaigns/${address}/requests`}>
        <a>Back</a>
      </Link>
      <h3>Create new Request</h3>
      <Form onSubmit={onSubmit} error={!!errorMessage}>
        <Form.Field>
          <label>Description</label>
          <Input
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </Form.Field>
        <Form.Field>
          <label>Value in Ether</label>
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        </Form.Field>
        <Form.Field>
          <label>Recipient</label>
          <Input
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
            }}
          />
        </Form.Field>
        <Message error header="Oops!" content={errorMessage} />
        <Button primary loading={loading}>
          Create!
        </Button>
      </Form>
    </Layout>
  );
};

RequestNew.getInitialProps = (props) => {
  const { address } = props.query;
  return { address };
};

export default RequestNew;
