import { readFileSync, writeFile } from 'fs';
let rawdata = readFileSync('../../Questions/data.json');
let jsonData = JSON.parse(rawdata);

let allSummaries = jsonData.summaries;

let preprocessed_data = {};

export default function preprocess() {
  for (let item of allSummaries) {
    item['summary'].split(' ').forEach(element => {
      let currState = {
        [item['id']]: 1
      };
      if (preprocessed_data.hasOwnProperty(element.toLowerCase())) {
        currState = Object.assign(
          {},
          preprocessed_data[element.toLowerCase()]['instances']
        );
        if (currState.hasOwnProperty(item['id'])) {
          currState[item['id']]++;
        } else {
          currState[item['id']] = 1;
        }
      }

      preprocessed_data[element.toLowerCase()] = {
        instances: currState
      };
    });
  }

  for (let [key, value] of Object.entries(preprocessed_data)) {
    let entries = Object.entries(value['instances']);
    let sorted = entries.sort((a, b) => b[1] - a[1]);
    preprocessed_data[key] = sorted;
  }

  writeFile('cache.json', JSON.stringify(preprocessed_data), err => {
    // In case of a error throw err.
    if (err) throw err;
  });
}
