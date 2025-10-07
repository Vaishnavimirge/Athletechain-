# DirectPayChain Smart Contract

## Overview

DirectPayChain is a Solidity smart contract that enables direct fund transfers from sponsors to athletes without intermediaries. All transactions are recorded on the blockchain, ensuring transparency and immutability.

## Features

- **Role-Based Access Control**: Admin, Sponsor, and Athlete roles
- **Direct Transfers**: Sponsors can send funds directly to athlete contracts
- **Transparent History**: All transactions are recorded and queryable
- **Secure Withdrawals**: Athletes can withdraw funds to their personal wallets
- **Immutable Records**: Transaction hashes provide permanent proof

## Contract Functions

### Admin Functions

```solidity
registerUser(address _userAddress, uint256 _roleId)
```
Register a new user with role (1 = Sponsor, 2 = Athlete)

### Sponsor Functions

```solidity
transferFunds(address _athleteAddress) payable
```
Transfer ETH to an athlete's contract balance

### Athlete Functions

```solidity
withdrawFunds(uint256 _amount)
```
Withdraw available balance to personal wallet

### View Functions

```solidity
getAthleteBalance(address _athleteAddress) returns (uint256)
getTransferCount() returns (uint256)
getTransfer(uint256 _index) returns (TransferEvent)
```

## Deployment

### Using Hardhat

1. **Install dependencies**:
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

2. **Initialize Hardhat** (if not already done):
```bash
npx hardhat
```

3. **Configure network** in `hardhat.config.js`:
```javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    goerli: {
      url: "YOUR_GOERLI_RPC_URL",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};
```

4. **Deploy**:
```bash
# Local network
npx hardhat run contracts/deploy.js

# Testnet (e.g., Goerli)
npx hardhat run contracts/deploy.js --network goerli
```

### Using Truffle

1. **Install Truffle**:
```bash
npm install -g truffle
```

2. **Create migration** in `migrations/2_deploy_contracts.js`:
```javascript
const DirectPayChain = artifacts.require("DirectPayChain");

module.exports = function (deployer) {
  deployer.deploy(DirectPayChain);
};
```

3. **Deploy**:
```bash
truffle migrate --network goerli
```

## Integration with Frontend

The deployed contract address and ABI can be used with ethers.js or web3.js to interact from the React frontend:

```typescript
import { ethers } from 'ethers';
import DirectPayChainABI from './DirectPayChain.json';

const CONTRACT_ADDRESS = "0x..."; // Your deployed contract address

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, DirectPayChainABI, signer);

// Example: Transfer funds
await contract.transferFunds(athleteAddress, { value: ethers.utils.parseEther("1.0") });
```

## Security Considerations

- Only the admin can register users
- Sponsors can only transfer to registered athletes
- Athletes can only withdraw their own balance
- All transfers emit events for off-chain tracking
- Uses OpenZeppelin patterns for secure development

## Testing

Create test files in `test/DirectPayChain.test.js`:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DirectPayChain", function () {
  let directPayChain;
  let admin, sponsor, athlete;

  beforeEach(async function () {
    [admin, sponsor, athlete] = await ethers.getSigners();
    const DirectPayChain = await ethers.getContractFactory("DirectPayChain");
    directPayChain = await DirectPayChain.deploy();
    await directPayChain.deployed();
  });

  it("Should register users correctly", async function () {
    await directPayChain.registerUser(sponsor.address, 1);
    await directPayChain.registerUser(athlete.address, 2);
    
    const sponsorData = await directPayChain.users(sponsor.address);
    expect(sponsorData.isRegistered).to.equal(true);
  });

  // Add more tests...
});
```

Run tests:
```bash
npx hardhat test
```

## License

MIT
