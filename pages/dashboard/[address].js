import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import { hasEthereum } from "../../utils/ethereum";
import Minter from "../../src/artifacts/contracts/Minter.sol/Minter.json";
import Wallet from "../../components/Wallet";
import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();
  // Call smart contract to mint NFT(s) from current address
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addressTo, setAddressTo] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [presaleLoading, setPresaleLoading] = useState(false);
  const [presaleSuccess, setPresaleSuccess] = useState(false);

  async function withdrawNFTs() {
    // Get wallet details
    if (!hasEthereum()) return;
    try {
      setWithdrawLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      try {
        const address = await signer.getAddress();

        // Interact with contract
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_MINTER_ADDRESS,
          Minter,
          signer
        );
        const transaction = await contract.withdraw();
        await transaction.wait();
        setWithdrawLoading(false);
        setWithdrawSuccess(true);
      } catch (error) {
        console.log("error", error);
        setWithdrawSuccess(false);
        setWithdrawLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      setWithdrawSuccess(false);
      setWithdrawLoading(false);
    }
  }

  async function isOwnerFunc() {
    try {
      // Interact with contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_MINTER_ADDRESS,
        Minter,
        provider
      );
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // const data = await contract.isOwner();
      const data = await contract.owner();

      if (data === address) {
        setIsOwner(true);
        return true;
      } else {
        setIsOwner(false);
        return false;
      }
    } catch (error) {
      // console.log(error);
      return false;
    }
  }

  async function transferOwnership() {
    setTransferLoading(true);
    if (addressTo?.length > 0) {
      if (
        confirm("are you sure you want to transfer ownership to " + addressTo)
      ) {
        if (!hasEthereum()) return;
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          try {
            // Interact with contract
            const contract = new ethers.Contract(
              process.env.NEXT_PUBLIC_MINTER_ADDRESS,
              Minter,
              signer
            );
            const transaction = await contract.transferOwnership(addressTo);
            await transaction.wait();
            setTransferLoading(false);
            setTransferSuccess(true);
          } catch (error) {
            console.log("error", error);
            setTransferLoading(false);
            setTransferSuccess(false);
          }
        } catch (error) {
          console.log("error", error);
          setTransferLoading(false);
          setTransferSuccess(false);
        }
      }
    }
  }

  async function endPresale() {
    setPresaleLoading(true);
    if (confirm("are you sure you want to end presale")) {
      if (!hasEthereum()) return;
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        try {
          // Interact with contract
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_MINTER_ADDRESS,
            Minter,
            signer
          );
          const transaction = await contract.setOnlyWhitelisted(false);
          await transaction.wait();
          setPresaleLoading(false);
          setPresaleSuccess(true);
        } catch (error) {
          console.log("error", error);
          setPresaleLoading(false);
          setPresaleSuccess(false);
        }
      } catch (error) {
        console.log("error", error);
        setPresaleLoading(false);
        setPresaleSuccess(false);
      }
    }
  }
  useEffect(function () {
    async function someChecks() {
      if (!hasEthereum()) {
        console.log("Install MetaMask");
        setLoading(false);
        return;
      }

      let isOw = await isOwnerFunc();
      if (!isOw) {
        router.push("/");
      }

      setLoading(false);
    }
    someChecks();
  });

  if (!isOwner) {
    return null;
  } else {
    return (
      <div className="max-w-xl mt-36 mx-auto px-4">
        <Head>
          <title>Angry Arab NFTs</title>
          <meta name="description" content="Mint an  Angry Arab NFT." />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Wallet />
        <main className="space-y-8">
          {!process.env.NEXT_PUBLIC_MINTER_ADDRESS ? (
            <p className="text-md">
              Please add a value to the <pre>NEXT_PUBLIC_MINTER_ADDRESS</pre>{" "}
              environment variable.
            </p>
          ) : (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-tr rounded-br w-1/3 mt-5"
                onClick={() => router.push("/")}
              >
                Go to Minting page
              </button>
              <h1 className="text-4xl font-semibold mb-8">
                Angry Arab NFTs Dashboard (OWNER ONLY)
              </h1>
              <div className="space-y-8">
                <div className="bg-gray-100 p-4 lg:p-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Dashboard Angry Arab NFTs
                    </h2>

                    <div className="flex justify-center flex-col items-center gap-5">
                      <input
                        className={
                          !false
                            ? "border p-4 text-center rounded-tl rounded-bl focus:outline-none focus:border-blue-600 w-full"
                            : "border border-red-500 p-4 text-center rounded-tl rounded-bl focus:outline-none focus:border-blue-600 w-full"
                        }
                        onChange={(e) => setAddressTo(e.target.value)}
                        value={addressTo}
                        placeholder="0x2cE9B798c47086EF7691d3f15331949F401f9CC0"
                        type="text"
                      />
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-tr rounded-br w-full"
                        onClick={transferOwnership}
                      >
                        {transferLoading
                          ? "Transferring ownership..."
                          : "Transfer Ownership"}
                      </button>

                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-tr rounded-br w-2/3 mt-5"
                        onClick={endPresale}
                      >
                        {presaleLoading ? "Loading..." : "END PRE-SALES"}
                      </button>

                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-tr rounded-br w-2/3 mt-5"
                        onClick={withdrawNFTs}
                      >
                        {withdrawLoading ? "Loading..." : "Withdraw"}
                      </button>
                    </div>
                    {transferSuccess && (
                      <span
                        className={
                          "text-green-600 text-xs mt-4 block text-center text-lg"
                        }
                      >
                        Transfer successful
                      </span>
                    )}

                    {withdrawSuccess && (
                      <span
                        className={
                          "text-green-600 text-xs mt-4 block text-center text-lg"
                        }
                      >
                        Withdrawal successful
                      </span>
                    )}

                    {presaleSuccess && (
                      <span
                        className={
                          "text-green-600 text-xs mt-4 block text-center text-lg"
                        }
                      >
                        Presale ended successfully
                      </span>
                    )}
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
}
