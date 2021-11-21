require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.MAIN_TEST_ACCOUNT_PK],
    },
  },
};


