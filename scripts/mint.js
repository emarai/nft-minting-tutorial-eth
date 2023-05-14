// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.attach(
    "0xcf9F9A1647f64821c02eEe0e9ca8A28E5D218429"
  );

  // await myToken.setBaseURI(
  //   "ipfs://QmejYa4kkcnCjDiZwy2YnNCY2CBBYnnxDV3V2F1Eh77iya/"
  // );

  // await myToken.mint(5, {
  //   value: hre.ethers.utils.parseEther((0.05 * 5).toString()),
  // });

  const tokenUri = await myToken.tokenURI(2);
  console.log(`tokenUri: ${tokenUri}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
