/**
 * Hardhat deployment script for DirectPayChain smart contract
 * 
 * Prerequisites:
 * 1. Install Hardhat: npm install --save-dev hardhat
 * 2. Install ethers: npm install --save-dev @nomiclabs/hardhat-ethers ethers
 * 3. Configure hardhat.config.js with your network settings
 * 
 * Deploy to local network: npx hardhat run scripts/deploy.js
 * Deploy to testnet: npx hardhat run scripts/deploy.js --network goerli
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting DirectPayChain deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString(), "\n");

  // Deploy DirectPayChain contract
  const DirectPayChain = await hre.ethers.getContractFactory("DirectPayChain");
  const directPayChain = await DirectPayChain.deploy();

  await directPayChain.deployed();

  console.log("✅ DirectPayChain deployed successfully!");
  console.log("📝 Contract address:", directPayChain.address);
  console.log("🔗 Transaction hash:", directPayChain.deployTransaction.hash, "\n");

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await directPayChain.deployTransaction.wait(5);
  console.log("✅ Confirmed!\n");

  console.log("📋 Contract deployment summary:");
  console.log("  - Network:", hre.network.name);
  console.log("  - Admin:", deployer.address);
  console.log("  - Contract:", directPayChain.address);
  console.log("\n🎉 Deployment complete!");
  
  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: directPayChain.address,
    admin: deployer.address,
    deploymentTime: new Date().toISOString(),
    txHash: directPayChain.deployTransaction.hash
  };
  
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
