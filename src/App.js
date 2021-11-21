import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/InsultPortal.json';

const App = () => {
  const defaultInsultee = "Tobias";

  const [currentAccount, setCurrentAccount] = useState("");

  const [allInsults, setAllInsults] = useState([]);
  const [insultee, setInsultee] = useState(defaultInsultee);
  const [insultType, setInsultType] = useState("");
  const [message, setMessage] = useState("");
  const [recentlyInsulted, setRecentlyInsulted] = useState(false);

  const contractAddress = "0x5193a9AbAD011A4105d87e9da6396a332F075eD1";

  const contractABI = abi.abi;

  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllInsults = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const insultPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllInsults method from your Smart Contract
         */
        const insults = await insultPortalContract.getAllInsults();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let insultsCleaned = [];
        insults.forEach(insult => {
          insultsCleaned.push({
            address: insult.insulter,
            insultType: insult.insultType,
            timestamp: new Date(insult.timestamp * 1000),
            message: insult.message,
            insultee: insult.insultee,
          });
        });

        /*
         * Store our data in React State
         */
        setAllInsults(insultsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  useEffect(() => {
    let insultPortalContract;

    const onNewInsult = (from, to,timestamp, insultType, message) => {
      console.log("NewInsult", from, to, timestamp, insultType, message);
      setAllInsults((prevState) => [
        ...prevState,
        {
          address: from,
          insultType: insultType,
          timestamp: new Date(timestamp * 1000),
          message: message,
          insultee: to,
        }
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      insultPortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      insultPortalContract.on("NewInsult", onNewInsult);
    }

    return () => {
      if (insultPortalContract) {
        insultPortalContract.off("NewInsult", onNewInsult);
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const insult = async (insultee, insultType, message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const insultPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await insultPortalContract.getTotalInsults();
        console.log("Retrieved total insult count...", count.toNumber());

        /*
        * Execute the actual insult from your smart contract
        */
        const insultTxn = await insultPortalContract.insult(
          defaultInsultee,
          "fat",
          "she brought a spoon to the Super Bowl"
        );
        console.log("Mining...", insultTxn.hash);

        await insultTxn.wait();
        console.log("Mined -- ", insultTxn.hash);

        count = await insultPortalContract.getTotalInsults();
        console.log("Retrieved total insult count...", count.toNumber());

        setRecentlyInsulted(true);
        setTimeout(function () {
          setRecentlyInsulted(false);        
        }, 5000);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    if (currentAccount) {getAllInsults()};
  }, [currentAccount])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="bio">WHAT TF DID YOU SAY ABOUT MA MOMMA???!!?!</div>

        

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount ? 
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
         :
        (recentlyInsulted ? (
            <img className="gif" src="https://i.imgur.com/rhCcmUv.gif" />
        ) : (
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              insult(insultee, insultType, message);
            }}
          >
            <input
              type="text"
              placeholder="Enter who you want to insult (default: me)"
              value={insultee}
              onChange={(event) => setInsultee(event.target.value)}
            />

            <input
              type="text"
              placeholder="Enter insult type (fat | stupid | ugly)"
              value={insultType}
              onChange={(event) => setInsultType(event.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Enter your insult!"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            />

            <button type="submit" className="insultButton">
              Yo' momma {insultee === defaultInsultee ? "Me" : insultee}
            </button>
          </form>
        ))
        }
        
        {console.log(allInsults)}
        {allInsults.map((insult, index) => {
          return (
            <div key={index} className={"insult"}>
              <div className="from">From: {insult.address}</div>
              <div>
                Hey, {insult.insultee}, yo momma so {insult.insultType},{" "}
                {insult.message}.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App