// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DirectPayChain
 * @dev Smart contract for direct athlete fund transfers
 * @notice This contract enables sponsors to transfer funds directly to athletes
 * with transparent, immutable transaction records
 */
contract DirectPayChain {
    // User roles
    enum UserRole { None, Sponsor, Athlete }
    
    // User structure
    struct User {
        address userAddress;
        UserRole role;
        bool isRegistered;
    }
    
    // Transaction structure
    struct TransferEvent {
        address sponsor;
        address athlete;
        uint256 amount;
        uint256 timestamp;
        bytes32 txHash;
    }
    
    // State variables
    address public admin;
    mapping(address => User) public users;
    mapping(address => uint256) public athleteBalances;
    TransferEvent[] public transferHistory;
    
    // Events
    event UserRegistered(address indexed userAddress, UserRole role);
    event FundsTransferred(
        address indexed sponsor,
        address indexed athlete,
        uint256 amount,
        uint256 timestamp,
        bytes32 txHash
    );
    event FundsWithdrawn(address indexed athlete, uint256 amount);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlySponsor() {
        require(
            users[msg.sender].role == UserRole.Sponsor,
            "Only sponsors can transfer funds"
        );
        _;
    }
    
    modifier onlyAthlete() {
        require(
            users[msg.sender].role == UserRole.Athlete,
            "Only athletes can withdraw funds"
        );
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Register a new user with a specific role
     * @param _userAddress Address of the user to register
     * @param _roleId Role ID (1 = Sponsor, 2 = Athlete)
     */
    function registerUser(address _userAddress, uint256 _roleId) 
        external 
        onlyAdmin 
    {
        require(!users[_userAddress].isRegistered, "User already registered");
        require(_roleId == 1 || _roleId == 2, "Invalid role ID");
        
        UserRole role = _roleId == 1 ? UserRole.Sponsor : UserRole.Athlete;
        users[_userAddress] = User(_userAddress, role, true);
        
        emit UserRegistered(_userAddress, role);
    }
    
    /**
     * @dev Transfer funds to an athlete
     * @param _athleteAddress Address of the athlete receiving funds
     */
    function transferFunds(address _athleteAddress) 
        external 
        payable 
        onlySponsor 
    {
        require(msg.value > 0, "Transfer amount must be greater than 0");
        require(
            users[_athleteAddress].role == UserRole.Athlete,
            "Recipient must be a registered athlete"
        );
        
        athleteBalances[_athleteAddress] += msg.value;
        
        bytes32 txHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _athleteAddress,
                msg.value,
                block.timestamp
            )
        );
        
        TransferEvent memory newTransfer = TransferEvent({
            sponsor: msg.sender,
            athlete: _athleteAddress,
            amount: msg.value,
            timestamp: block.timestamp,
            txHash: txHash
        });
        
        transferHistory.push(newTransfer);
        
        emit FundsTransferred(
            msg.sender,
            _athleteAddress,
            msg.value,
            block.timestamp,
            txHash
        );
    }
    
    /**
     * @dev Withdraw available funds to athlete's wallet
     * @param _amount Amount to withdraw in wei
     */
    function withdrawFunds(uint256 _amount) 
        external 
        onlyAthlete 
    {
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(
            athleteBalances[msg.sender] >= _amount,
            "Insufficient balance"
        );
        
        athleteBalances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        
        emit FundsWithdrawn(msg.sender, _amount);
    }
    
    /**
     * @dev Get athlete's current balance
     * @param _athleteAddress Address of the athlete
     * @return Current balance in wei
     */
    function getAthleteBalance(address _athleteAddress) 
        external 
        view 
        returns (uint256) 
    {
        return athleteBalances[_athleteAddress];
    }
    
    /**
     * @dev Get total number of transfers
     * @return Total transfer count
     */
    function getTransferCount() external view returns (uint256) {
        return transferHistory.length;
    }
    
    /**
     * @dev Get transfer details by index
     * @param _index Index in transfer history
     * @return Transfer event details
     */
    function getTransfer(uint256 _index) 
        external 
        view 
        returns (TransferEvent memory) 
    {
        require(_index < transferHistory.length, "Invalid transfer index");
        return transferHistory[_index];
    }
}
