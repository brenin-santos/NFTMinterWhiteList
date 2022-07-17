import { useEffect, useState, useCallback } from "react";
import { connectWallet, getCurrentWalletConnected } from "./utils/interact";

import "./Minter.css";

import detectEthereumProvider from "@metamask/detect-provider";

import { whitelist } from "./utils/whitelist";

const MinterWhiteList = (props) => {
  const [walletAddress, setWalletAddress] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [maxSupply, setMaxSupply] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [error, setError] = useState("");
  const [price, setPrice] = useState(0);
  const [walletIsWhiteList, setWallerIsWhiteList] = useState(false);
  const [isFree, setIsFree] = useState(true);

  const { ethers } = require("ethers");
  const contractABI = require("./contract-abi.json");
  const contractAddress = "0x92e954c294ca960B9DDc1c5950729e54e5c24a90";

  useEffect(() => {
    async function fetchData() {
      const { address, status } = await getCurrentWalletConnected();
      setWalletAddress(address);
      setStatus(status);

      addWalletListener();
    }
    fetchData();
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();

    setStatus(walletResponse.status);
    setWalletAddress(walletResponse.address);
  };

  useEffect(() => {
    if (quantity === 0) {
      setQuantity(1);
    }
    if (quantity > 3) {
      setQuantity(3);
    }
  }, [quantity]);

  const getWhiteList = useCallback(async () => {
    if (walletAddress) {
      const useWhiteList = !!whitelist.find(
        (item) => item === `${walletAddress}`
      );

      setWallerIsWhiteList(useWhiteList);
    }
  }, [walletAddress]);

  useEffect(() => {
    getWhiteList();
  }, [getWhiteList]);

  const calculatePrice = useCallback(async () => {
    const browserProvider = await detectEthereumProvider();
    const provider = new ethers.providers.Web3Provider(browserProvider);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider.getSigner()
    );
    const tokenPrice = await contract.cost();

    const newPrice = ethers.utils.formatEther(tokenPrice._hex);

    const conta = (newPrice * quantity).toFixed(3);

    setPrice(conta);
  }, [
    contractABI,
    ethers.Contract,
    ethers.providers.Web3Provider,
    ethers.utils,
    quantity,
  ]);

  useEffect(() => {
    calculatePrice();
  }, [quantity, calculatePrice]);

  const getFreePrice = useCallback(async () => {
    const browserProvider = await detectEthereumProvider();

    const provider = new ethers.providers.Web3Provider(browserProvider);

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider.getSigner()
    );

    const balanceOf = await contract.balanceOf(contractAddress);

    const newBalanceOf = ethers.utils.formatEther(balanceOf._hex);

    const quantidadeDeMints = "0.000000000000000001";

    if (newBalanceOf < quantidadeDeMints && walletIsWhiteList) {
      setIsFree(true);
    } else {
      setIsFree(false);
    }
  }, [
    contractABI,
    ethers.Contract,
    ethers.providers.Web3Provider,
    ethers.utils,
    walletIsWhiteList,
  ]);

  useEffect(() => getFreePrice(), [getFreePrice]);

  useEffect(() => {
    if (walletAddress) {
      const getSupply = async () => {
        const browserProvider = await detectEthereumProvider();
        const provider = new ethers.providers.Web3Provider(browserProvider);
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider.getSigner()
        );

        const totalSupply = await contract.totalSupply();

        setTotalSupply(Number(totalSupply._hex));

        const supplyQuantity = await contract.maxSupply();

        setMaxSupply(Number(supplyQuantity._hex));
      };
      getSupply();
    }
  }, [
    walletAddress,
    contractAddress,
    ethers.providers.Web3Provider,
    ethers.Contract,
    contractABI,
  ]);

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 10000);
  }, [error]);

  useEffect(() => {
    if (isFree) {
      setQuantity(1);
    }
  }, [isFree, quantity]);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWalletAddress("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const mintTokens = async (mintAmount) => {
    if (isFree) {
      const browserProvider = await detectEthereumProvider();
      const provider = new ethers.providers.Web3Provider(browserProvider);
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider.getSigner()
      );

      try {
        await contract.mint(mintAmount, {
          value: 0,
        });
      } catch (e) {
        setError(e.code);
      }
    } else {
      const browserProvider = await detectEthereumProvider();
      const provider = new ethers.providers.Web3Provider(browserProvider);
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider.getSigner()
      );
      const tokenPrice = await contract.cost();

      try {
        await contract.mint(mintAmount, {
          value: tokenPrice.mul(mintAmount),
        });
      } catch (e) {
        setError(e.code);
      }
    }
  };

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      <header>
        <a href="https://twitter.com.br">
          <img src="img/twitter.png" alt="Twitter" className="twitter-icon" />
        </a>
        <img
          src="img/etherscan.png"
          alt="Etherscan"
          className="etherscan-icon"
        />
        <img src="img/opensea.png" alt="Twitter" className="openSea-icon" />
      </header>
      <main>
        <section className="section-down-header">
          <img
            src="img/MINT.png"
            alt="Stranger Friends"
            className="image-down-header"
          ></img>
        </section>
        {walletAddress !== "" ? (
          <section className="section-down-section-name">
            <div className="card-wallet-address">
              <p className="wallet-name">Wallet Address:</p>
              <p>{walletAddress}</p>
            </div>
            <div className="card-middle-screen">
              <div className="card-supply">
                <p className="wallet-name">Supply:</p>
                <p>
                  {totalSupply}/{maxSupply}
                </p>
              </div>
              <div className="card-supply">
                <p className="wallet-name">Sale Status:</p>
                {totalSupply === maxSupply ? <p>Closed</p> : <p>Open</p>}
              </div>
              {isFree ? (
                <div className="card-supply">
                  <p className="wallet-name">Price:</p>
                  <p>Free White List</p>
                </div>
              ) : (
                <div className="card-supply">
                  <p className="wallet-name">Price:</p>
                  <p>{price} ETH</p>
                </div>
              )}
            </div>

            <div className="container-inputs-buttons">
              <div className="card-button">
                <div className="card-input">
                  <button
                    className="card-negative"
                    onClick={() => setQuantity(quantity - 1)}
                  >
                    -
                  </button>
                  <div className="card-input-number">{quantity}</div>
                  <button
                    className="card-positive"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="button-down-section"
                type="button"
                onClick={() => mintTokens(quantity)}
              >
                MINT
              </button>
            </div>
            <div className="card-image-update">
              <img src="img/etherscan.png" alt="test" />
            </div>
          </section>
        ) : (
          <section className="section-down-section-name">
            <button
              className="button-down-section-connect"
              type="button"
              onClick={() => connectWalletPressed()}
            >
              Connect Wallet
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default MinterWhiteList;
