const { network } = require("hardhat");

function sleep(timeInMs) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`Waited for ${timeInMs} Ms`);
    }, 2000);
  });
}

async function moveBlocks(amount, sleepAmount = 0) {
  console.log("Moving Blocks ...");
  for (let x = 0; x < amount; x++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
    if (sleepAmount) {
      console.log(`Sleeping for ${sleepAmount}`);
      await sleep(sleepAmount);
    }
  }
  console.log(`Moved ${amount} blocks`);
}

module.exports = {
  moveBlocks,
  sleep,
};
