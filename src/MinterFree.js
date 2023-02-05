import { useEffect, useState, useCallback } from "react";
import { connectWallet, getCurrentWalletConnected } from "./utils/interact";

import "./Minter.css";

import detectEthereumProvider from "@metamask/detect-provider";

const MinterFree = () => {
  const [walletAddress, setWallet] = useState("");
  const [isFree, setIsFree] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [maxSupply, setMaxSupply] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [error, setError] = useState("");
  const [price, setPrice] = useState(0);

  const { ethers } = require("ethers");
  const contractABI = require("./contract-abi.json");
  const contractAddress = "0x28b44614080047260371E8AAa98FE279D93f673e";

  useEffect(() => {
    async function fetchData() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);

      addWalletListener();
    }
    fetchData();
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();

    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  useEffect(() => {
    if (quantity === 0) {
      setQuantity(1);
    }
    if (quantity > 3) {
      setQuantity(3);
    }
  }, [quantity]);

  const getFreePrice = useCallback(async () => {
    const browserProvider = await detectEthereumProvider();

    const provider = new ethers.providers.Web3Provider(browserProvider);

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider.getSigner()
    );

    const balanceOf = await contract.balanceOf(walletAddress);

    const newBalanceOf = ethers.utils.formatEther(balanceOf._hex);

    const quantidadeDeMints = "0.000000000000000001";

    if (newBalanceOf < quantidadeDeMints) {
      setIsFree(true);
    } else {
      setIsFree(false);
    }
  }, [
    contractABI,
    ethers.Contract,
    ethers.providers.Web3Provider,
    ethers.utils,
    walletAddress,
  ]);

  useEffect(() => getFreePrice(), [getFreePrice]);

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

    if (isFree) {
      const conta = (newPrice * (quantity - 1)).toFixed(3);

      setPrice(conta);
    } else {
      const conta = (newPrice * quantity).toFixed(3);

      setPrice(conta);
    }
  }, [
    contractABI,
    ethers.Contract,
    ethers.providers.Web3Provider,
    ethers.utils,
    quantity,
    isFree,
  ]);

  useEffect(() => {
    calculatePrice();
  }, [quantity, calculatePrice]);

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

        const supplyQuantity = await contract.currentMaxSupply();

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
    if (totalSupply > maxSupply) {
      setError("You have exceeded the maximum supply of this token.");
    } else {
      setError("");
    }
  }, [totalSupply, maxSupply]);
  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 10000);
  }, [error]);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
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

  useEffect(() => {
    if (isFree) {
      setQuantity(1);
    }
  }, [isFree, quantity]);

  const mintTokens = async (mintAmount) => {
    if (isFree) {
      if (quantity === 1) {
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
    <div className="container" style={{ height: "120vh" }}>
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
              {isFree && quantity < 2 ? (
                <div className="card-supply">
                  <p className="wallet-name" style={{ fontSize: "20px" }}>
                    First is Free
                  </p>
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

export default MinterFree;
