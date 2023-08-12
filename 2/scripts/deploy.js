// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Ponzi = await ethers.getContractFactory("PonziContract");
  const ponzi = await Ponzi.deploy();
  await ponzi.deployed();
  console.log("PonziContract deployed to:", ponzi.address);

  const SuperHackingMalicious = await ethers.getContractFactory("SuperHackingMaliciousContract");
  const superHackingMalicious = await SuperHackingMalicious.deploy();
  await superHackingMalicious.deployed();
  console.log("SuperHackingMalicious deployed to:", superHackingMalicious.address);

  const AlwaysReverts = await ethers.getContractFactory("AlwaysReverts");
  const alwaysReverts = await AlwaysReverts.deploy();
  await alwaysReverts.deployed();
  console.log("AlwaysReverts deployed to:", alwaysReverts.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
