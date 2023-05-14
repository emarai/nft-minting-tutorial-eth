// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// https://github.com/HashLips/hashlips_nft_contract/blob/main/contract/SimpleNft.sol
// https://dev.to/envoy_/implement-gasless-whitelist-in-your-nft-contract-4j4l
contract MyToken is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public cost = 0.05 ether;
    uint256 public maxSupply = 777;
    uint256 public maxMintAmount = 20;
    bytes32 public root;

    constructor(bytes32 _root) ERC721("MyToken", "MTK") {
        root = _root;
    }

    string private baseUri;

    function mint(uint256 _mintAmount, bytes32[] memory proof) public payable {
        uint256 supply = totalSupply();
        require(
            isWhitelisted(proof, keccak256(abi.encodePacked(msg.sender))),
            "NOT_IN_WHITELIST"
        );
        require(_mintAmount > 0);
        require(_mintAmount <= maxMintAmount);
        require(supply + _mintAmount <= maxSupply);

        require(msg.value >= cost * _mintAmount);

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function walletOfOwner(
        address _owner
    ) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function setBaseURI(string memory newBaseUri) public onlyOwner {
        baseUri = newBaseUri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function isWhitelisted(
        bytes32[] memory proof,
        bytes32 leaf
    ) public view returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }
}
