// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Enderun {
    // Smart contract draft for Enderun SG multisig wallet
    address[] public studentGovernment;
    uint256 public quorum;
    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals;
        bool sent;
    }

    mapping(uint256 => Transfer) public transferLog;
    mapping(address => mapping(uint256 => bool)) approvals;
    uint256 nextId;

    constructor(address[] memory _studentGovernment, uint256 _quorum) payable {
        studentGovernment = _studentGovernment;
        quorum = _quorum;
    }

    receive() external payable {}

    function deposit() public payable {}

    function balance() public view returns(uint256) {
        return address(this).balance;
    }

    function currentId() public view returns(uint256) {
        // To keep track of transfer proposal history
        return nextId;
    }

    function transactionProposal(address payable _to, uint256 _amount) external onlySG {
        require(_amount <= address(this).balance, "Not enough funds for proposed transaction");
        transferLog[nextId] = Transfer(
            nextId,
            _amount,
            _to,
            0,
            false
        );
        nextId++;
    }

    function executeTransaction(uint256 _id) external onlySG {
       // The transaction functionality will not execute unless enough approvals are incremented. 
       require(transferLog[_id].sent == false, "This transfer has aleady been sent");
       require(approvals[msg.sender][_id] == false, "cannot vote more than once");
       transferLog[_id].approvals++;
       // if statement executes the function only when the approvals field matches the quorum.
       if(transferLog[_id].approvals == quorum) {
           address payable _to = transferLog[_id].to;
           uint256 _amount = transferLog[_id].amount;
           transferLog[_id].sent = true;
           _to.transfer(_amount);
       }
    }

    modifier onlySG {
        // This modifier maps through the student government address array and
        // only allows a function call if the msg.sender is found within the array. 
        bool allowed = false;
        for(uint256 i = 0; i < studentGovernment.length; i++){
            if(studentGovernment[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed == true, "You do not have proper access rights");
        _;
    }
}
