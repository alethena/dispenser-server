const Json2csvParser = require('json2csv').Parser;
const fields = [ 'timestamp', 'blockNumber', 'buy', 'sell', 'price', 'volume',  'amount', 'fee', 'insider', 'user', 'txhash', 'contractAddress', ];

const json2csvParser = new Json2csvParser({
    fields
});

function convertToCSV(notCSV: any) {
    const csv = json2csvParser.parse(notCSV);
    return csv;
}

module.exports = convertToCSV;
