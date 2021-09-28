require('dotenv').config()
const hre = require('hardhat')

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

async function main () {
  const ethers = hre.ethers

  console.log('network:', await ethers.provider.getNetwork())

  const signer = (await ethers.getSigners())[0]
  console.log('signer:', await signer.getAddress())

  const config = {
    deployRandomNumberGenerator: false,
    deployCosmicswapLottery: true,
  }

  let randomGeneratorAddress = '0xcBd474DdE6E9f41526829c35C84eD8006844F90d'

  const vrfCoordinator = '0x747973a5A2a4Ae1D3a8fDF5479f1514F65Db9C31'
  const linkToken = '0x404460C6A5EdE2D891e8297795264fDe62ADBB75'

  const cosmicTokenAddress = '0x960cC8F437165b7362a34D95D1ec62Dd2A940f00'

  /**
   *  Deploy RandomNumberGenerator
   */

  if (config.deployRandomNumberGenerator) {
    const RandomNumberGenerator = await ethers.getContractFactory('RandomNumberGenerator', {
      signer: (await ethers.getSigners())[0]
    })

    const rngContract = await RandomNumberGenerator.deploy(
      vrfCoordinator,
      linkToken
    );
    await rngContract.deployed()

    console.log('RandomNumberGenerator deployed to:', rngContract.address)

    await sleep(60);
    await hre.run("verify:verify", {
      address: rngContract.address,
      contract: "contracts/RandomNumberGenerator.sol:RandomNumberGenerator",
      constructorArguments: [vrfCoordinator, linkToken]
    })

    randomGeneratorAddress = rngContract.address

    console.log('RandomNumberGenerator token contract verified')

  }


  /**
   *  Deploy CosmicswapLottery
   */

  if(config.deployCosmicswapLottery) {
    const CosmicswapLottery = await ethers.getContractFactory('CosmicswapLottery', {
      signer: (await ethers.getSigners())[0]
    })

    const lotteryContract = await CosmicswapLottery.deploy(
      cosmicTokenAddress,
      randomGeneratorAddress
    );
    await lotteryContract.deployed()

    console.log('CosmicswapLottery deployed to:', lotteryContract.address)
    
    await sleep(60);
    await hre.run("verify:verify", {
      address: lotteryContract.address,
      contract: "contracts/CosmicswapLottery.sol:CosmicswapLottery",
      constructorArguments: [cosmicTokenAddress, randomGeneratorAddress],
    })

    console.log('CosmicswapLottery token contract verified')
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
