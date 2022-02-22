import React, { useEffect, useState } from "react";
import { Card, Button } from "semantic-ui-react";
import factory from "../ethereum/factory";
import "semantic-ui-css/semantic.min.css";

const CampaignIndex = ({ campaigns }) => {
  //Render all campaigns
  const renderCampaigns = () => {
    const items = campaigns.map((address) => {
      return {
        header: address,
        description: <a>View Campaign</a>,
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  };

  return (
    <div>
      <h3>Open Campaigns</h3>
      {renderCampaigns()}
      <Button
        content="Create Campaign"
        icon="add circle"
        primary
        labelPosition="right"
      />
    </div>
  );
};

//Executes on Next.js server
CampaignIndex.getInitialProps = async () => {
  const campaigns = await factory.methods.getDeployedCampaigns().call();
  return { campaigns };
};

export default CampaignIndex;
