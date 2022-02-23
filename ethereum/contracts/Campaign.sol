pragma solidity ^0.8.11;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint min) public {
        address newCampaign = address(new Campaign(min, msg.sender)); //Deploy new instance of campaign
        deployedCampaigns.push(newCampaign); //Add to deployed campaigns
    }

    function getDeployedCampaigns() public view returns(address[] memory){
        return deployedCampaigns;
    }
}

contract Campaign {
    //Definitions
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    //Instance variables
    address public manager;
    uint public minContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    uint numRequests;
    mapping (uint => Request) public requests;

    //Modifiers
    modifier restricted() {
        require(msg.sender == manager); //Makes sure manager is the sender
        _;
    }

    //Functions
    constructor(uint min, address sender) {
       manager = sender; 
       minContribution = min;
       approversCount = 0;
       numRequests = 0;
    }

    function contribute() public payable {
        require(msg.value >= minContribution); //Make sure minContribution 
        approvers[payable(msg.sender)] = true;
        approversCount++;
    }

    function createRequest(string memory description, uint value, address recipient) public restricted {
        Request storage r = requests[numRequests++];
        r.description = description;
        r.value = value;
        r.recipient = payable(recipient);
        r.complete = false;
        r.approvalCount = 0;
    }

    function approveRequest(uint index) public {
        Request storage r = requests[index]; //Store local request variable r

        require(approvers[msg.sender]); //Make sure sender is an approver
        require(!r.approvals[msg.sender]); //Make sure has not voted already

        r.approvals[msg.sender] = true; //Mark person as having voted
        r.approvalCount++; //Increment approval count
    }

    function finalizeRequest(uint index) public payable restricted {
        Request storage r = requests[index]; //Store local request variable r

        require(!r.complete); //Check that request is not already marked as complete
        require(r.approvalCount > (approversCount / 2));  //Check whether/not request has gotten enough approvals

        r.recipient.transfer(r.value);//Send to recipient
        r.complete = true; //Mark as completed
    }

    function getSummary() public view returns (
        uint,
        uint,
        uint,
        uint,
        address
    ) {
        return(     
            minContribution,
            address(this).balance,
            numRequests,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return numRequests;
    }
  
}

