// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract InsultPortal {
    uint256 totalInsults;
    uint256 private seed;

    struct Insult {  
        string insultType;  
        string message; 
        address insulter;
        uint256 timestamp;
        string insultee;
    }

    /*
     * A little magic, Google what events are in Solidity!
     */
    event NewInsult(address indexed from, string to, uint256 timestamp, string insultType, string message);

    /*
     * I declare a variable waves that lets me store an array of structs.
     * This is what lets me hold all the waves anyone ever sends to me!
     */
    Insult[] insults;

    mapping(address => uint256) public lastWavedAt;

    constructor() payable {
        seed = (block.timestamp + block.difficulty) % 100;
    }

    /*
     * You'll notice I changed the wave function a little here as well and
     * now it requires a string called _message. This is the message our user
     * sends us from the frontend!
     */
    function insult(string memory _insultee, string memory _insultType, string memory _message) public {
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30s"
        );

        lastWavedAt[msg.sender] = block.timestamp;
        
        totalInsults += 1;
        console.log("%s has insulted!", msg.sender);

        /*
         * This is where I actually store the wave data in the array.
         */
        insults.push(Insult(_insultType, _message, msg.sender, block.timestamp, _insultee));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        if (seed <= 50) {
            console.log("%s won!", msg.sender);

            /*
             * The same code we had before to send the prize.
             */
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        /*
         * I added some fanciness here, Google it and try to figure out what it is!
         * Let me know what you learn in #general-chill-chat
         */
        emit NewInsult(msg.sender, _insultee,block.timestamp, _insultType, _message);
    }

    /*
     * I added a function getAllWaves which will return the struct array, waves, to us.
     * This will make it easy to retrieve the waves from our website!
     */
    function getAllInsults() public view returns (Insult[] memory) {
        return insults;
    }

    function getTotalInsults() public view returns (uint256) {
        // Optional: Add this line if you want to see the contract print the value!
        // We'll also print it over in run.js as well.
        console.log("We have %d total insults!", totalInsults);
        return totalInsults;
    }
}