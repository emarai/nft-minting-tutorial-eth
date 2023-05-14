const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();

    await myToken.deployed();

    return { myToken, owner, otherAccount };
  }

  describe("Custom functions", function () {
    it("Should mint", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployContract
      );

      await myToken
        .connect(otherAccount)
        .mint(1, { value: ethers.utils.parseEther("0.05") });

      const mintedTokenId = await myToken.tokenOfOwnerByIndex(
        otherAccount.address,
        0
      );
      expect(mintedTokenId).to.exist;
    });

    it("Should mint 20", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployContract
      );

      await myToken
        .connect(otherAccount)
        .mint(20, { value: ethers.utils.parseEther((0.05 * 20).toString()) });

      const ownerOfToken = await myToken.walletOfOwner(otherAccount.address);
      expect(ownerOfToken.length).to.eq(20);
    });

    it("Should set baseUri", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployContract
      );
      await myToken
        .connect(otherAccount)
        .mint(1, { value: ethers.utils.parseEther("0.05") });

      await myToken.setBaseURI("ipfs://random/");

      const mintedTokenId = await myToken.tokenOfOwnerByIndex(
        otherAccount.address,
        0
      );

      const tokenUri = await myToken.tokenURI(mintedTokenId);
      expect(tokenUri).to.be.equal(`ipfs://random/${mintedTokenId}.json`);
    });
  });
});
