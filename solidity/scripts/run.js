/* eslint-disable no-undef */
const main = async () => {
  const insultContractFactory = await hre.ethers.getContractFactory(
    "InsultPortal"
  );
  const insultContract = await insultContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await insultContract.deployed();
  console.log("Contract addy:", insultContract.address);

  let insultCount;
  insultCount = await insultContract.getTotalInsults();
  console.log(insultCount.toNumber());

  /**
   * Let's send a few insults!
   */
  let insultTxn = await insultContract.insult(
    "0xe39b53995e469103128e2a285e3a8DDD0097aD6f",
    "fat",
    "she brought a spoon to the Super Bowl"
  );
  await insultTxn.wait(); // Wait for the transaction to be mined

  let contractBalance = await hre.ethers.provider.getBalance(
    insultContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  const [_, randomPerson] = await hre.ethers.getSigners();
  insultTxn = await insultContract
    .connect(randomPerson)
    .insult(
      "0xe39b53995e469103128e2a285e3a8DDD0097aD6f",
      "ugly",
      "her portraits hang themselves"
    );
  await insultTxn.wait(); // Wait for the transaction to be mined

  contractBalance = await hre.ethers.provider.getBalance(
    insultContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allInsults = await insultContract.getAllInsults();
  console.log(allInsults);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
