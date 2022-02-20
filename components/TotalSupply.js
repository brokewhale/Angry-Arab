import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { hasEthereum, requestAccount } from "../utils/ethereum";
import Minter from "../src/artifacts/contracts/Minter.sol/Minter.json";

export default function TotalSupply() {
  // UI state
  const [loading, setLoading] = useState(true);
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [MINT_PRICE, SET_MINT_PRICE] = useState(0.054);
  const [ifPresale, setIfPresale] = useState(false);

  // Constants
  const TOTAL = 1000;

  useEffect(function () {
    async function fetchTotals() {
      if (!hasEthereum()) {
        console.log("Install MetaMask");
        setLoading(false);
        return;
      }

      await getTotalSupply();
      // await getTotalValue()
      await getIfPresale();

      setLoading(false);
    }
    fetchTotals();
  });

  // Get total supply of tokens from smart contract
  async function getTotalSupply() {
    try {
      // Interact with contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_MINTER_ADDRESS,
        Minter,
        provider
      );
      const data = await contract.totalSupply();

      setTotalMinted(data.toNumber());
    } catch (error) {
      console.log(error);
    }
  }

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
        SET_MINT_PRICE(50);
        setIfPresale(true);
      } else {
        SET_MINT_PRICE(90);
        setIfPresale(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Get total value collected by the smart contract
  //  async function getTotalValue() {
  //     try {
  //       // Interact with contract
  //       const provider = new ethers.providers.Web3Provider(window.ethereum)
  //       const contract = new ethers.Contract(process.env.NEXT_PUBLIC_MINTER_ADDRESS, Minter.abi, provider)
  //       const data = await contract.getBalance()

  //       setTotalValue(ethers.utils.formatEther(data).toString());
  //     } catch(error) {
  //         console.log(error)
  //     }
  // }

  return (
    <>
      <p>
        Tokens minted: {loading ? "Loading..." : `${totalMinted}/${TOTAL}`}
        <br />
        NFT Value:{" "}
        {loading
          ? "Loading..."
          : `${MINT_PRICE} MATIC  - ${ifPresale ? "PRESALE" : "PUBLIC SALE"}`}
      </p>
    </>
  );
}
