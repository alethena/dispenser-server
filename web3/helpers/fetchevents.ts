import ABI from 'web3/eth/abi';
import { EventLog } from 'web3/types';

const web3 = require('./gethConnection').web3;

async function fetchEvents(abi: ABI, contractAddress: string, startingBlock: number): Promise<EventLog[]>{
    return new Promise(async function (resolve, reject) {
        try {
            const myContract = await new web3.eth.Contract(abi, contractAddress);
            const pastEvents = await myContract.getPastEvents("allEvents", {
                fromBlock: startingBlock,
                toBlock: "latest"
            });
            resolve(pastEvents);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}

module.exports.fetchEvents = fetchEvents;
export { };