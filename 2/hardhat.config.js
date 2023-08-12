require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/{TOKEN}}`,
      accounts: { mnemonic: "Metamask test mnemonic" },
      gasPrice: 20000000000
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/{TOKEN}}`,
      accounts: { mnemonic: "Metamask test mnemonic" },
      gasPrice: 20000000000
    },
  },
};
