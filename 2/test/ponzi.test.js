const { expect } = require("chai");
const { ethers } = require("hardhat");

/*
The Reentrancy Attack will show that the malicious contract can siphon more funds than it sent. 
The Unchecked Return Value will show that funds intended for the 
AlwaysReverts contract will not get transferred, but the contract state proceeds as if they were.
*/

describe("PonziContract Vulnerabilities", function() {
    let ponzi, malicious, owner, attacker, newAffiliate;

    beforeEach(async function() {
        [owner, attacker, newAffiliate] = await ethers.getSigners();
        
        const Ponzi = await ethers.getContractFactory("PonziContract");
        
        ponzi = await Ponzi.deploy();
        await ponzi.deployed(); 
        console.log("PonziContract Address:", ponzi.address);
    });

    it("Reentrancy Attack", async function() {
        const Malicious = await ethers.getContractFactory("SuperHackingMaliciousContract");
        malicious = await Malicious.deploy(ponzi.address);
        await malicious.deployed();
        console.log("MaliciousContract Address:", malicious.address);

        await ponzi.setDeadline(9999999999);
        await ponzi.addNewAffilliate(malicious.address);
        await malicious.attack({value: ethers.utils.parseEther("2")});
        
        expect(await ethers.provider.getBalance(malicious.address)).to.be.above(ethers.utils.parseEther("2"));
    });

    it("Unchecked Return Value", async function() {
        await ponzi.setDeadline(9999999999); 
        await ponzi.addNewAffilliate(newAffiliate.address);
        
        const AlwaysRevertsFactory = await ethers.getContractFactory("AlwaysReverts");
        const alwaysReverts = await AlwaysRevertsFactory.deploy();

        // This will send funds, but the call to alwaysReverts will fail, and the funds get locked
        await ponzi.joinPonzi([alwaysReverts.address], {value: ethers.utils.parseEther("1")});
        
        expect(await ethers.provider.getBalance(alwaysReverts.address)).to.equal(0);
    });
});
