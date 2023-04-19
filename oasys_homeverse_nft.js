// Syed Umar Bukhari April 2023
//This code is a combination of the SDK approach and the Web3 approach, taking the simplicity of the SDK for minting NFTs and listing them for sale while using the Web3 library to interact with the smart contract directly for buying NFTs and displaying NFTs owned by a user. It works for both Oasys and HomeVerse platforms.
//Install the SDK:
//For Oasys SDK: npm install @oasys/sdk
// For HomeVerse SDK: npm install @homeverse/sdk
const { Oasys } = require('@oasys/sdk');
const { HomeVerse } = require('@homeverse/sdk');
const Web3 = require('web3');

const oasys = new Oasys('<ENTER_YOUR_API_KEY>');
const homeverse = new HomeVerse('<ENTER_YOUR_API_KEY>');

const web3 = new Web3('https://rpc.oasys.games');

const metadata = {
  name: "Umar NFT",
  description: "DEMO NFT for Development",
  image: "https://your-nft-image-url-here.com"
};

const mintNFT = async (sdk) => {
  const mintResponse = await sdk.mintNFT(metadata);
  console.log(mintResponse);
  return mintResponse.tokenId;
};

const listNFTForSale = async (sdk, tokenId, price) => {
  const accounts = await web3.eth.getAccounts();
  const contractABI = sdk.getNFTContractABI();
  const contractAddress = sdk.getNFTContractAddress();
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  await contract.methods.approve(sdk.marketplaceAddress, tokenId).send({
    from: accounts[0],
  });

  await sdk.createListing(contractAddress, tokenId, price, {
    from: accounts[0],
  });
};

(async () => {
  const tokenIdOasys = await mintNFT(oasys);
  const tokenIdHomeVerse = await mintNFT(homeverse);

  const price = web3.utils.toWei('1', 'ether');
  await listNFTForSale(oasys, tokenIdOasys, price);
  await listNFTForSale(homeverse, tokenIdHomeVerse, price);
})();

// Function to buy an NFT using MetaMask
const buyNFT = async (sdk, tokenId, price) => {
  const accounts = await web3.eth.getAccounts();
  const contractABI = sdk.getMarketplaceContractABI();
  const contractAddress = sdk.marketplaceAddress;
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  await contract.methods.buy(tokenId).send({
    from: accounts[0],
    value: price,
  });
};

// Function to display NFTs owned by a user using MetaMask
const displayUserNFTs = async (sdk) => {
  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];
  const nfts = await sdk.getNFTsByOwner(userAddress);
  console.log('NFTs owned by user:', nfts);
};

(async () => {
  // Assuming you have the tokenId and price (in wei) for the NFT you want to buy
  const tokenId = 1;
  const price = web3.utils.toWei('1', 'ether');

  await buyNFT(oasys, tokenId, price);
  await buyNFT(homeverse, tokenId, price);

  await displayUserNFTs(oasys);
  await displayUserNFTs(homeverse);
})();
