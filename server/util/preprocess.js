const fs = require('fs');
const path = require('path');
const jsondata = JSON.parse(fs.readFileSync(__dirname + '/data.json'));

let allSummaries = jsondata.summaries;

let preprocessed_unsorted_data = {};

const lowRank = ['is', 'are', 'in', 'the', 'a', 'of', 'this', 'that', 'your'];

const sortPreProcessedDataInstances = (unsorted_data) => {
  for (let [key, value] of Object.entries(unsorted_data)) {
    let entries = Object.entries(value['instances']);
    let sorted = entries.sort((a, b) => b[1] - a[1]);
    unsorted_data[key]['instances'] = sorted;
  }
  return {
    sorted_data: unsorted_data,
  };
};

const storePreProcessedDataInJSONToFile = (sorted_data) => {
  fs.writeFile('./util/cache.json', JSON.stringify(sorted_data), (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
};

const processData = (inputStr, bulkProcessing) => {
  for (let item of allSummaries) {
    let inputArray;
    if (bulkProcessing) {
      item['summary'] = item['summary'].replace(/[^a-zA-Z ]/g, '');
      inputArray = item['summary'].split(' ');
    } else {
      inputArray = inputStr;
    }
    inputArray.forEach((str) => {
      let currState = {
        [item['id']]: 1,
      };
      let lowercaseStr = str.toLowerCase();
      let totalFrequency = 1,
        totalInstances = 1;
      if (preprocessed_unsorted_data.hasOwnProperty(lowercaseStr)) {
        currState = Object.assign(
          {},
          preprocessed_unsorted_data[lowercaseStr]['instances']
        );
        if (currState.hasOwnProperty(item['id'])) {
          currState[item['id']]++;
        } else {
          currState[item['id']] = 1;
        }
      }
      totalFrequency = Object.values(currState).reduce((a, b) => a + b, 0);
      totalInstances = Object.keys(currState).length;

      preprocessed_unsorted_data[lowercaseStr] = {
        instances: currState,
        totalFrequency,
        totalInstances,
        rank:
          lowRank.includes(lowercaseStr) || totalFrequency === 0
            ? -1
            : lowercaseStr.split(' ').length,
      };
    });
  }
  return preprocessed_unsorted_data;
};

const preprocess = (inputStr, bulkProcessing = true) => {
  let unsortedData = processData(inputStr, bulkProcessing);
  let preprocessed_sorted_data = Object.assign(
    {},
    sortPreProcessedDataInstances(unsortedData)['sorted_data']
  );
  storePreProcessedDataInJSONToFile(preprocessed_sorted_data);

  return preprocessed_sorted_data;
};

module.exports = {
  preprocess,
  sortPreProcessedDataInstances,
  storePreProcessedDataInJSONToFile,
};
