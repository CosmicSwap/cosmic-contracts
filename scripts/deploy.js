async function main() {
    const Token = await ethers.getContractFactory("CosmicToken");
    const MasterChef = await ethers.getContractFactory("MasterChef");
    
    // Start deployment, returning a promise that resolves to a contract object
    const token = await Token.deploy();
    const masterChef = await MasterChef.deploy();

    console.log("Token deployed to address:", token.address);
    console.log("MasterChef deployed to address:", masterChef.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });