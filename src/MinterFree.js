import { useEffect, useState, useCallback } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  handleContract,
} from "./utils/interact";
import { formatEther } from "./utils/formats";

import { Header } from "./components/Header";

import "./Minter.css";

const MinterFree = () => {
  const [walletAddress, setWallet] = useState("");
  const [contract, setContract] = useState(null);
  const [isFree, setIsFree] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [maxSupply, setMaxSupply] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [error, setError] = useState("");
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const fetchContract = async () => {
      const contract = await handleContract();
      setContract(contract);
    };
    fetchContract();
  }, []);

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
    const balanceOf = await contract.balanceOf(walletAddress);

    const newBalanceOf = formatEther(balanceOf);

    const quantidadeDeMints = "0.000000000000000001";

    if (newBalanceOf < quantidadeDeMints) {
      setIsFree(true);
    } else {
      setIsFree(false);
    }
  }, [contract, walletAddress]);

  useEffect(() => getFreePrice(), [getFreePrice]);

  const calculatePrice = useCallback(async () => {
    const tokenPrice = await contract.cost();

    const newPrice = formatEther(tokenPrice);

    if (isFree) {
      const conta = (newPrice * (quantity - 1)).toFixed(3);

      setPrice(conta);
    } else {
      const conta = (newPrice * quantity).toFixed(3);

      setPrice(conta);
    }
  }, [contract, isFree, quantity]);

  useEffect(() => {
    calculatePrice();
  }, [quantity, calculatePrice]);

  useEffect(() => {
    if (walletAddress) {
      const getSupply = async () => {
        const totalSupply = await contract.totalSupply();

        setTotalSupply(Number(totalSupply._hex));

        const supplyQuantity = await contract.currentMaxSupply();

        setMaxSupply(Number(supplyQuantity._hex));
      };
      getSupply();
    }
  }, [walletAddress, contract]);

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
        try {
          await contract.mint(mintAmount, {
            value: 0,
          });
        } catch (e) {
          setError(e.code);
        }
      }
    } else {
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
      <Header />
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
