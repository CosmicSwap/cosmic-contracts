// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libs/IBEP20.sol";

contract COSMICPresale is ReentrancyGuard {
  using SafeMath for uint256;
  // Maps user to the number of tokens owned
  mapping (address => uint256) tokensOwned;
  // Cosmic token
  IBEP20 cosmic;
  // Sale ended
  bool isSaleActive;
  // Starting timestamp normal
  uint256 startingTimeStamp;
  uint256 totalTokensSold = 0;
  uint256 tokensPerBNB = 83;
  uint256 bnbReceived = 0;
  
  address payable owner;
  
  modifier onlyOwner(){
    require(msg.sender == owner, "You are not the owner");
    _;
  }
  
  event TokenBuy(address user, uint256 tokens);
  event TokenClaim(address user, uint256 tokens);

  constructor (address _cosmicAddress, uint256 _startingTimestamp) public {
    cosmic = IBEP20(_cosmicAddress);
    isSaleActive = true;
    owner = msg.sender;
    startingTimeStamp = _startingTimestamp;
  }

  receive() external payable {
    buy (msg.sender);
  }
  
  
  function buy (address beneficiary) public payable nonReentrant {
    require(isSaleActive, "Sale is not active yet");
      
    address _buyer = beneficiary;
    uint256 _bnbSent = msg.value;
    uint256 tokens = _bnbSent.mul(tokensPerBNB);
    
    
    require (_bnbSent >= 0.5 ether, "BNB is lesser than min value");
    require (_bnbSent <= 10 ether, "BNB is greater than max value");
    require (bnbReceived < 750 ether, "Hardcap reached");
    require (msg.value.add(bnbReceived) <= 750 ether, "Purchase would exceed hardcap");
    require(block.timestamp >= startingTimeStamp, "Presale has not started");
    
    tokensOwned[_buyer] = tokensOwned[_buyer].add(tokens);
    totalTokensSold = totalTokensSold.add(tokens);
    bnbReceived = bnbReceived.add(msg.value);
    emit TokenBuy(beneficiary, tokens);
  }
  
  function setSaleActive(bool _isSaleActive) external onlyOwner {
      isSaleActive = _isSaleActive;
  }

  function getTokensOwned () external view returns (uint256) {
    return tokensOwned[msg.sender];
  }

  function getCosmicTokensLeft () external view returns (uint256) {
    return cosmic.balanceOf(address(this));
  }
  
  function claimTokens () external {
    require (isSaleActive == false, "Sale is still active");
    require (tokensOwned[msg.sender] > 0, "User should own some cosmic tokens");
    require (cosmic.balanceOf(address(this)) >= tokensOwned[msg.sender], "There are not enough cosmic tokens to transfer");

    cosmic.transfer(msg.sender, tokensOwned[msg.sender]);
    emit TokenClaim(msg.sender, tokensOwned[msg.sender]);
    tokensOwned[msg.sender] = 0;
  }

  function withdrawFunds () external onlyOwner {
    owner.transfer(address(this).balance);
  }
  
  function withdrawUnsoldCosmic() external onlyOwner {
      cosmic.transfer(msg.sender, cosmic.balanceOf(address(this)));
  }
}