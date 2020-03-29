const fs = require('fs');

let rawdata = fs.readFileSync('../../Questions/data.json');
let jsonData = JSON.parse(rawdata);

let allSummaries = jsonData.summaries;

let preprocessed_data = new Map();

for (let item of allSummaries) {
  item['summary'].split(' ').forEach(element => {
    if (preprocessed_data.has(element.toLowerCase())) {
      let currState = Object.assign(
        {},
        preprocessed_data.get(element.toLowerCase())[0]
      );
      if (currState.hasOwnProperty(item['id'])) {
        currState[item['id']]++;
      } else {
        currState[item['id']] = 1;
      }

      preprocessed_data.set(element.toLowerCase(), [currState]);
    } else {
      preprocessed_data.set(element.toLowerCase(), [
        {
          [item['id']]: 1
        }
      ]);
    }
  });
}

// console.log(preprocessed_data);

console.log('json out:', Object.fromEntries(preprocessed_data));
