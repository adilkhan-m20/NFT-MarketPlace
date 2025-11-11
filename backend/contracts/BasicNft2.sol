//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft2 is ERC721{
    string public constant TOKEN_URI = "ipfs://QmUtTSrk5djqeWxPaqP3ubTATTjamnogHvFtVGYmArjBYs";
    uint256 private s_tokenCounter;
    mapping(uint256 => bool) private _minted;

    event DragonMinted(uint256 indexed tokenId);
    
    constructor() ERC721("Dragon","DRAG"){
        s_tokenCounter = 0;
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        emit DragonMinted(s_tokenCounter);
        _minted[s_tokenCounter] = true;
        s_tokenCounter = s_tokenCounter+1;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns(string memory){
        require(_minted[tokenId]);
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns(uint256){
        return s_tokenCounter;
    }
}