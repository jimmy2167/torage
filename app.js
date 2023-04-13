const ipfs = new window.IpfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const contractAddress = '0x123abc'; 0x8b9B5a9C58521ddE46dAa6b780c2b6aB607AC814
const contractABI = [[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fileId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "fileHash",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "fileName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "fileType",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fileSize",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "fileDescription",
				"type": "string"
			}
		],
		"name": "FileAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_fileHash",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "_fileName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_fileType",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_fileSize",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_fileDescription",
				"type": "string"
			}
		],
		"name": "storeFile",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fileCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "files",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "fileHash",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "fileName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "fileType",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "fileSize",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "fileDescription",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]];

window.addEventListener('load', async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
    } catch (error) {
      console.error('User denied account access');
    }
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.error('No Web3 provider detected');
  }

  const fileUploadForm = document.getElementById('file-upload-form');
  const fileInput = document.getElementById('file-input');
  fileUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = fileInput.files[0];
    const fileBuffer = await file.arrayBuffer();
    const fileHash = await addFileToIPFS(fileBuffer);
    const txHash = await addFileToBlockchain(fileHash);
    const fileUrl = `https://ipfs.io/ipfs/${fileHash}`;
    document.getElementById('file-hash').value = fileUrl;
  });
});

async function addFileToIPFS(fileBuffer) {
  const filesAdded = await ipfs.add({ content: fileBuffer });
  return filesAdded.cid.toString();
}

async function addFileToBlockchain(fileHash) {
  const contract = new window.web3.eth.Contract(contractABI, contractAddress);
  const accounts = await window.web3.eth.getAccounts();
  const result = await contract.methods.storeFile(fileHash).send({ from: accounts[0] });
  return result.transactionHash;
}

