import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import { hasEthereum } from "../utils/ethereum";
import Minter from "../public/config/Minter.json";
import TotalSupply from "../components/TotalSupply";
import Wallet from "../components/Wallet";
import YourNFTs from "../components/YourNFTs";

export default function Home() {
  // Constants
  // const MINT_PRICE = 0.054;
  const MAX_MINT = 10;

  const [MINT_PRICE, SET_MINT_PRICE] = useState(50);

  // UI state
  const [mintQuantity, setMintQuantity] = useState(1);
  const mintQuantityInputRef = useRef();
  const [mintError, setMintError] = useState(false);
  const [mintMessage, setMintMessage] = useState("");
  const [mintLoading, setMintLoading] = useState(false);

  // Call smart contract to mint NFT(s) from current address
  async function mintNFTs() {
    // Check quantity
    if (mintQuantity < 1) {
      setMintMessage("You need to mint at least 1 NFT.");
      setMintError(true);
      mintQuantityInputRef.current.focus();
      return;
    }
    if (mintQuantity > MAX_MINT) {
      setMintMessage("You can only mint a maximum of 10 NFTs.");
      setMintError(true);
      mintQuantityInputRef.current.focus();
      return;
    }

    // Get wallet details
    if (!hasEthereum()) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      try {
        const address = await signer.getAddress();

        setMintLoading(true);
        // Interact with contract
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_MINTER_ADDRESS,
          Minter,
          signer
        );
        const totalPrice = MINT_PRICE * mintQuantity;
        const isOwner = await contract.isOwner();

        if (isOwner) {
          const transaction = await contract.mint(mintQuantity);
          await transaction.wait();

          mintQuantityInputRef.current.value = 0;
          setMintMessage(`Congrats, you minted ${mintQuantity} token(s)!`);
          setMintError(false);
        } else {
          const transaction = await contract.mint(mintQuantity, {
            value: ethers.utils.parseEther(totalPrice.toString()),
          });
          await transaction.wait();

          mintQuantityInputRef.current.value = 0;
          setMintMessage(`Congrats, you minted ${mintQuantity} AANFTS(s)!`);
          setMintError(false);
        }
      } catch {
        setMintMessage(
          "An Error occurred check if your wallet is  connected and your account balance"
        );
        setMintError(true);
      }
    } catch (error) {
      setMintMessage(error.message);
      setMintError(true);
    }
    setMintLoading(false);
  }

  useEffect(function () {
    async function fetchInit() {
      if (!hasEthereum()) {
        console.log("Install MetaMask");
        // setLoading(false);
        return;
      }

      await getIfPresale();
      // await getTotalValue()
    }
    fetchInit();
  });

  async function getIfPresale() {
    try {
      // Interact with contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_MINTER_ADDRESS,
        Minter,
        provider
      );
      const data = await contract.onlyWhitelisted();

      if (data) {
        SET_MINT_PRICE(0.5);
      } else {
        SET_MINT_PRICE(50);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      className=""
      style={{
        maxWidth: "100vw",
        minHeight: "100vh",
        backgroundColor: "black",
      }}
    >
      <Head>
        <title>Angry Arab NFTs</title>
        <meta name="description" content="Mint an  Angry Arab NFT." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Wallet />
      <main
        className="space-y-8"
        style={{
          height: "85vh",
          display: "grid",
          placeContent: "center",
        }}
      >
        {!process.env.NEXT_PUBLIC_MINTER_ADDRESS ? (
          <p className="text-md">
            Please add a value to the <pre>NEXT_PUBLIC_MINTER_ADDRESS</pre>{" "}
            environment variable.
          </p>
        ) : (
          <>
            <div
              className="dd"
              style={{
                width: "90vw",
                height: "500px",
                backgroundColor: "#1a1a1a",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <div className="arabPng"></div>

              <div className="mintSec">
                <h1
                  style={{
                    fontSize: "50px",
                    color: "#ffc03c",
                    marginBottom: "20px",
                  }}
                >
                  Angry Arab Nft
                </h1>
                <div>
                  <p className="tp">Presale value: 50 MATIC</p>
                  <p className="tp">Public Sale value: 90 MATIC</p>
                  <p className="tp">(Gas fee Excluded)</p>
                </div>

                <div
                  className="hh"
                  style={{
                    marginTop: "20px",
                    width: "80%",
                    margin: "0 auto",
                    borderRadius: "10px",
                    backgroundColor: "#333333",
                    height: "150px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      flex: 0.6,
                      padding: "10px",
                    }}
                  >
                    select number of AA to be minted max 10/wallet
                  </div>

                  <div
                    style={{
                      flex: 0.4,
                      padding: "15px",
                    }}
                  >
                    <input
                      type="number"
                      style={{
                        borderRadius: "8px",
                        padding: "8px",
                        color: "black",
                      }}
                      onChange={(e) => setMintQuantity(e.target.value)}
                      value={mintQuantity}
                      placeholder="1"
                      min="1"
                      max="10"
                      ref={mintQuantityInputRef}
                    />
                    <button
                      style={{
                        width: "100%",
                        height: "50px",
                        backgroundColor: "#ffc03c",
                        color: "black",
                        marginTop: "18px",
                      }}
                      onClick={mintNFTs}
                    >
                      {mintLoading ? "Loading..." : "Mint"}
                    </button>
                  </div>
                </div>
                {mintMessage && (
                  <span
                    className={
                      mintError
                        ? "text-red-600 text-xs mt-2 block"
                        : "text-green-600 text-xs mt-2 block"
                    }
                  >
                    {mintMessage}
                  </span>
                )}
                <div className="mt-8 tsp">
                  <TotalSupply />
                </div>
              </div>
            </div>
          </>
        )}
        {/* <YourNFTs /> */}
      </main>

      <footer className="mt-20 text-center">
        <a
          href="https://artbywurd.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 mb-8 inline-block"
        >
          Angry Arab website
        </a>
      </footer>
    </div>
  );
}
