import Web3 from 'web3';
import bip39 from '../libs/bip39.js';
import hdkeySpec from '../libs/hdkey.js';
const hdkey = hdkeySpec.default;
import ethereumJsTx from '../libs/ethereumjs-tx.js';
import {makePromise} from './util.js';
import {storageHost, web3MainnetSidechainEndpoint, web3RinkebySidechainEndpoint} from './constants.js';
const {Transaction, Common} = ethereumJsTx;

const getBlockchain = async () => {
  const  addresses = await fetch('https://contracts.webaverse.com/config/addresses.js').then(res => res.text()).then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));

   const abis = await fetch('https://contracts.webaverse.com/config/abi.js').then(res => res.text()).then(s => JSON.parse(s.replace(/^\s*export\s*default\s*/, '')));

  let {
    mainnet: {Account: AccountAddress, FT: FTAddress, NFT: NFTAddress, FTProxy: FTProxyAddress, NFTProxy: NFTProxyAddress, Trade: TradeAddress, LAND: LANDAddress, LANDProxy: LANDProxyAddress },
    mainnetsidechain: {Account: AccountAddressSidechain, FT: FTAddressSidechain, NFT: NFTAddressSidechain, FTProxy: FTProxyAddressSidechain, NFTProxy: NFTProxyAddressSidechain, Trade: TradeAddressSidechain, LAND: LANDAddressSidechain, LANDProxy: LANDProxyAddressSidechain },
  } = addresses;
  let {Account: AccountAbi, FT: FTAbi, FTProxy: FTProxyAbi, NFT: NFTAbi, NFTProxy: NFTProxyAbi, Trade: TradeAbi, LAND:LANDAbi, LANDProxy: LANDProxyAbi } = abis;

  let injectedWeb3;
  if (typeof window !== 'undefined' && window.ethereum) {
    injectedWeb3 = new Web3(window.ethereum);
  } else {
    injectedWeb3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/0bb8f708513d45a1881ec056c7296df9"));
  }

  const web3 = {
    mainnet: injectedWeb3,
    mainnetsidechain: new Web3(new Web3.providers.HttpProvider(web3MainnetSidechainEndpoint)),
    rinkeby: injectedWeb3,
    rinkebysidechain: new Web3(new Web3.providers.HttpProvider(web3RinkebySidechainEndpoint)),
    front: null,
    back: null,
  };
  let addressFront = null;
  let addressBack = null;
  let networkName = '';
  let common = null;
  function _setMainChain(isMainChain) {
    if (isMainChain) {
      web3.front = web3.mainnet;
      web3.back = web3.mainnetsidechain;
      addressFront = addresses.mainnet;
      addressBack = addresses.mainnetsidechain;
      networkName = 'mainnet';
    } else {
      web3.front = web3.rinkeby;
      web3.back = web3.rinkebysidechain;
      addressFront = addresses.rinkeby;
      addressBack = addresses.rinkebysidechain;
      networkName = 'rinkeby';
    }
    common = Common.forCustomChain(
      'mainnet',
      {
        name: 'geth',
        networkId: 1,
        chainId: isMainChain ? 1338 : 1337,
      },
      'petersburg',
    );
  }

  if (typeof window !== 'undefined' && /^test\./.test(location.hostname)) {
    _setMainChain(false);
  } else {
    _setMainChain(true);
  }

  const contracts = {
    front: {
      Account: new web3.front.eth.Contract(abis.Account, addressFront.Account),
      FT: new web3.front.eth.Contract(abis.FT, addressFront.FT),
      FTProxy: new web3.front.eth.Contract(abis.FTProxy, addressFront.FTProxy),
      NFT: new web3.front.eth.Contract(abis.NFT, addressFront.NFT),
      NFTProxy: new web3.front.eth.Contract(abis.NFTProxy, addressFront.NFTProxy),
      Trade: new web3.front.eth.Contract(abis.Trade, addressFront.Trade),
      LAND: new web3.front.eth.Contract(abis.LAND, addressFront.LAND),
      LANDProxy: new web3.front.eth.Contract(abis.LANDProxy, addressFront.LANDProxy),
    },
    back: {
      Account: new web3.back.eth.Contract(abis.Account, addressBack.Account),
      FT: new web3.back.eth.Contract(abis.FT, addressBack.FT),
      FTProxy: new web3.back.eth.Contract(abis.FTProxy, addressBack.FTProxy),
      NFT: new web3.back.eth.Contract(abis.NFT, addressBack.NFT),
      NFTProxy: new web3.back.eth.Contract(abis.NFTProxy, addressBack.NFTProxy),
      Trade: new web3.back.eth.Contract(abis.Trade, addressBack.Trade),
      LAND: new web3.back.eth.Contract(abis.LAND, addressBack.LAND),
      LANDProxy: new web3.back.eth.Contract(abis.LANDProxy, addressBack.LANDProxy),
    },
  };

  const getNetworkName = () => networkName;
  const getOtherNetworkName = () => networkName === 'mainnet' ? 'Mainnet' : 'Rinkeby';

  const getMainnetAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const [address] = await window.ethereum.enable();
      return address || null;
    } else {
      return null;
    }
  };

  return { web3, contracts, addresses, common, getNetworkName, getOtherNetworkName, getMainnetAddress, };
}

const transactionQueue = {
  running: false,
  queue: [],
  lock() {
    if (!this.running) {
      this.running = true;
      return Promise.resolve();
    } else {
      const promise = makePromise();
      this.queue.push(promise.accept);
      return promise;
    }
  },
  unlock() {
    this.running = false;
    if (this.queue.length > 0) {
      this.queue.shift()();
    }
  },
};
const runSidechainTransaction = mnemonic => async (contractName, method, ...args) => {
  const { web3, contracts, common } = await getBlockchain();
  const wallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic)).derivePath(`m/44'/60'/0'/0/0`).getWallet();
  const address = wallet.getAddressString();
  const privateKey = wallet.getPrivateKeyString();
  const privateKeyBytes = Uint8Array.from(web3['back'].utils.hexToBytes(privateKey));

  const txData = contracts['back'][contractName].methods[method](...args);
  const data = txData.encodeABI();
  const gas = await txData.estimateGas({
    from: address,
  });
  let gasPrice = await web3['back'].eth.getGasPrice();
  gasPrice = parseInt(gasPrice, 10);

  await transactionQueue.lock();
  const nonce = await web3['back'].eth.getTransactionCount(address);
  let tx = Transaction.fromTxData({
    to: contracts['back'][contractName]._address,
    nonce: '0x' + new web3['back'].utils.BN(nonce).toString(16),
    gas: '0x' + new web3['back'].utils.BN(gasPrice).toString(16),
    gasPrice: '0x' + new web3['back'].utils.BN(gasPrice).toString(16),
    gasLimit: '0x' + new web3['back'].utils.BN(8000000).toString(16),
    data,
  }, {
    common,
  }).sign(privateKeyBytes);
  const rawTx = '0x' + tx.serialize().toString('hex');
  const receipt = await web3['back'].eth.sendSignedTransaction(rawTx);
  transactionQueue.unlock();
  return receipt;
};
const getTransactionSignature = async (chainName, contractName, transactionHash) => {
  const { getNetworkName } = await getBlockchain();
  const networkName = getNetworkName();

  if (networkName === "mainmain" && chainName === "front") {
    chainName = "mainnet";
  } else if (networkName === "mainnet" && chainName === "back") {
    chainName = "mainnetsidechain";
  } else if (networkName === "rinkeby" && chainName === "front") {
    chainName = "rinkeby";
  } else if (networkName === "rinkeby" && chainName === "back") {
    chainName = "rinkebysidechain";
  }

  const u = `https://sign.exokit.org/${chainName}/${contractName}/${transactionHash}`;
  for (let i = 0; i < 10; i++) {
    const signature = await fetch(u).then(res => res.json());
    if (signature) {
      return signature;
    } else {
      await new Promise((accept, reject) => {
        setTimeout(accept, 1000);
      });
    }
  }
  return null;
};

const runMainnetTransaction = async (contractName, method, ...args) => {
  const { contracts, getMainnetAddress } = await getBlockchain();

  const address = await getMainnetAddress();
  if (address) {
    const m = contracts.front[contractName].methods[method];
    const receipt = await m.apply(m, args).send({
      from: address,
    });
    return receipt;
  } else {
    throw new Error('no addresses passed by web3');
    return Error('no addresses passed by web3');
  }
};

const _getWalletFromMnemonic = mnemonic => hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic))
  .derivePath(`m/44'/60'/0'/0/0`)
  .getWallet();

const getAddressFromMnemonic = mnemonic => _getWalletFromMnemonic(mnemonic)
  .getAddressString();

export {
  getBlockchain,
  runSidechainTransaction,
  runMainnetTransaction,
  getTransactionSignature,
  getAddressFromMnemonic,
};
