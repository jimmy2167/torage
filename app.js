// Import required packages
// Use ES8 syntax
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable require-await */

'use strict';
const express = require('express');
const multer = require('multer');
const ipfsHttpClient = require('ipfs-http-client');
const Web3 = require('web3');
const contractABI = require('./contractABI.json');

// Initialize the app and set the port
const app = express();
const port = process.env.PORT || 3000;

// Initialize IPFS client
const ipfs = ipfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// Initialize Ethereum client
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// Initialize contract instance
const contractAddress = '0x123456789ABCDEF'; // Replace with your contract address
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

// Initialize Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve static files
app.use(express.static('public'));

// Render home page
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Add file to IPFS
    const { cid } = await ipfs.add(req.file.buffer);

    // Get current user's Ethereum address
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];

    // Get nonce
    const nonce = await web3.eth.getTransactionCount(address);

    // Create transaction object
    const tx = {
      from: address,
      to: contractAddress,
      nonce: nonce,
      gas: 2000000,
      data: contractInstance.methods.addFile(cid).encodeABI(),
    };

    // Sign and send transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, 'YOUR_PRIVATE_KEY');
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`File uploaded to Ethereum with transaction hash: ${receipt.transactionHash}`);

    // Redirect back to home page
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

// Handle file download
app.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get file CID from Ethereum
    const cid = await contractInstance.methods.getFile(parseInt(id)).call();

    // Get file from IPFS and pipe to response
    const fileStream = ipfs.cat(cid);
    fileStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

// Start the server
app.listen(port, () => console.log(`App listening on port ${port}`));
