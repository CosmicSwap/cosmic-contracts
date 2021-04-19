const { ethers } = require("ethers");

async function main() {
    const Token = await ethers.getContractFactory("CosmicToken");
    const MasterChef = await ethers.getContractFactory("MasterChef");
    const Presale = await ethers.getContractFactory("Presale")
    
    // Start deployment, returning a promise that resolves to a contract object
    const token = await Token.deploy();
    const masterChef = await MasterChef.deploy(token.address, 0);
    const presale = await Presale.deploy(token.address, 0);

    console.log("Token deployed to address:", token.address);
    console.log("MasterChef deployed to address:", masterChef.address);
    console.log("Presale deployed to address:", presale.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });