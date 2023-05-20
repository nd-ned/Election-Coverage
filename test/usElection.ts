import { USElection } from "./../typechain-types/Election.sol/USElection";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("USElection", function () {
  let usElectionFactory;
  let usElection: USElection;

  before(async () => {
    usElectionFactory = await ethers.getContractFactory("USElection");

    usElection = await usElectionFactory.deploy();

    await usElection.deployed();
  });

  it("Should return the current leader before submit any election results", async function () {
    expect(await usElection.currentLeader()).to.equal(0); // NOBODY
  });

  it("Should return the election status", async function () {
    expect(await usElection.electionEnded()).to.equal(false); // Not Ended
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults: USElection.StateResultStruct = {
      name: "California",
      votesBiden: 1000,
      votesTrump: 900,
      stateSeats: 32,
    };

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(1); // BIDEN
  });

  it("Should throw when try to submit already submitted state results", async function () {
    const stateResults: USElection.StateResultStruct = {
      name: "California",
      votesBiden: 1000,
      votesTrump: 900,
      stateSeats: 32,
    };

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "This state result was already submitted!"
    );
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults: USElection.StateResultStruct = {
      name: "Ohaio",
      votesBiden: 800,
      votesTrump: 1200,
      stateSeats: 33,
    };

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP
  });

  //TODO: ADD YOUR TESTS
  it("Should throw when try to submit state results with 0 seats", async function () {
    const stateResults: USElection.StateResultStruct = {
      name: "Texas",
      votesBiden: 1000,
      votesTrump: 900,
      stateSeats: 0,
    };


    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "States must have at least 1 seat"
    );
  });

  it("Should throw when try to submit state results without being the owner", async function () {
    const stateResults: USElection.StateResultStruct = {
      name: "Miami",
      votesBiden: 2000,
      votesTrump: 900,
      stateSeats: 39,
    };

    const [signer0, signer1] = await ethers.getSigners();

    const usElectionWithSigner1 = usElection.connect(signer1);

    expect(usElectionWithSigner1.submitStateResult(stateResults)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Should throw when try to submit state results with a tie", async function () {
    const stateResults: USElection.StateResultStruct = {
      name: "Texas",
      votesBiden: 1000,
      votesTrump: 1000,
      stateSeats: 32,
    };

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "There cannot be a tie"
    );
  });

  it("Should end the elections, get the leader and election status", async function () {
    const endElectionTx = await usElection.endElection();

    await endElectionTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP

    expect(await usElection.electionEnded()).to.equal(true); // Ended
  });

  it("Should throw when try to end election without being the owner", async function () {
    const [signer0, signer1] = await ethers.getSigners();

    const usElectionWithSigner1 = usElection.connect(signer1);

    expect(usElectionWithSigner1.endElection()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Should throw when try to end election twice", async function () {
    expect(usElection.endElection()).to.be.revertedWith(
      "The election has ended already"
    );
  });

  it("Should throw when try to submit state results after election ended", async function () {
    const stateResults: USElection.StateResultStruct = {
      name: "Texas",
      votesBiden: 1000,
      votesTrump: 900,
      stateSeats: 32,
    };

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "The election has ended already"
    );
  });
});
