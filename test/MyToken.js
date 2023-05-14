const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const BN = require("bn.js");

describe("MyToken", function () {
  async function deployContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();

    await myToken.deployed();
    await myToken.addToWhitelist([otherAccount.address]);

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

      const ownerOfToken = await myToken.ownerOf(1);
      expect(ownerOfToken).to.equal(otherAccount.address);
    });

    it("Should mint 20", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployContract
      );

      await myToken
        .connect(otherAccount)
        .mint(20, { value: ethers.utils.parseEther((0.05 * 20).toString()) });

      const ownerOfToken = await myToken.walletOfOwner(otherAccount.address);
      expect(ownerOfToken[0]).to.equal(1);
      expect(ownerOfToken[ownerOfToken.length - 1]).to.equal(20);
    });

    it("Should withdraw", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployContract
      );

      await myToken
        .connect(otherAccount)
        .mint(20, { value: ethers.utils.parseEther((0.05 * 20).toString()) });

      const tokenBalanceBefore = await ethers.provider.getBalance(
        myToken.address
      );

      await myToken.withdraw();

      const tokenBalanceAfter = await ethers.provider.getBalance(
        myToken.address
      );

      expect(tokenBalanceAfter.toString()).to.be.eq(
        tokenBalanceBefore
          .sub(ethers.utils.parseEther((0.05 * 20).toString()))
          .toString()
      );
    });

    it("Should set baseUri", async function () {
      const { myToken, owner, otherAccount } = await loadFixture(
        deployContract
      );
      await myToken
        .connect(otherAccount)
        .mint(1, { value: ethers.utils.parseEther("0.05") });

      await myToken.setBaseURI("ipfs://random/");

      const tokenUri = await myToken.tokenURI(1);
      expect(tokenUri).to.be.equal("ipfs://random/1.json");
    });
  });
});
