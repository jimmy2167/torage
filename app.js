// Connect Wallet Button
const connectButton = document.getElementById("connectButton");
connectButton.addEventListener("click", async () => {
	if (window.ethereum) {
		try {
			await window.ethereum.request({ method: "eth_requestAccounts" });
			alert("Wallet connected!");
		} catch (error) {
			alert("Error connecting wallet.");
			console.error(error);
		}
	} else {
		alert("Please install MetaMask to use this interface.");
	}
});

// Upload File
const uploadButton = document.getElementById("uploadButton");
uploadButton.addEventListener("click", async (event) => {
	event.preventDefault();
	const file = document.getElementById("fileInput").files[0];
	if (!file) {
		alert("Please select a file to upload.");
		return;
	}
	try {
		const Web3 = require('web3');
		const web3 = new Web3(window.ethereum);
		const accounts = await web3.eth.getAccounts();
		const ipfs = new IpfsHttpClient({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
		const ipfsFile = await ipfs.add(file);
		alert(`File uploaded to IPFS with hash: ${ipfsFile.cid.toString()}`);
	} catch (error) {
		alert("Error uploading file.");
		console.error(error);
	}
});

// Download File
const downloadButton = document.getElementById("downloadButton");
downloadButton.addEventListener("click", async () => {
	const ipfsHash = document.getElementById("ipfsHashInput").value;
	if (!ipfsHash) {
		alert("Please enter an IPFS hash.");
		return;
	}
	try {
		const ipfs = new IpfsHttpClient({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
		const stream = ipfs.cat(ipfsHash);
		const blob = new Blob([await streamToArray(stream)]);
		const url = URL.createObjectURL(blob);
		const downloadLink = document.getElementById("downloadLink");
		downloadLink.href = url;
		downloadLink.download = ipfsHash;
		downloadLink.click();
	} catch (error) {
		alert("Error downloading file.");
		console.error(error);
	}
});

// Helper function to convert a stream to an array
function streamToArray(stream) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("error", reject);
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}
