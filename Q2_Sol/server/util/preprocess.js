const fs = require('fs'); //helper module to read/write files
const jsondata = JSON.parse(fs.readFileSync(__dirname + '/data.json')); // parsing the json file

let allSummaries = jsondata.summaries; // store summaries array in allSummaries

//defined reserved list of words that have low rank of 0
const lowRank = ['is', 'are', 'in', 'the', 'a', 'of', 'this', 'that', 'your'];

const sortCalculatedSubstringInstances = (unsorted_data) => {
  for (let [key, value] of Object.entries(unsorted_data)) {
    let entries = Object.entries(value['instances']);
    let sorted = entries.sort((a, b) => b[1] - a[1]);
    unsorted_data[key]['instances'] = sorted;
  }
  return {
    sorted_data: unsorted_data,
  };
};

const storeCalculatedSubstringInstancesInFile = (sorted_data) => {
  fs.writeFile('./util/cache.json', JSON.stringify(sorted_data), (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
};

const calculateInstancesOfStringsInSummaries = (inputStr, bulkProcessing) => {
  let preprocessed_unsorted_data = {};
  for (let item of allSummaries) {
    let inputArray;
    if (bulkProcessing) {
      item['summary'] = item['summary'].replace(/[^a-zA-Z ]/g, ''); //remove special characters
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
  let subStringInstancesObj = calculateInstancesOfStringsInSummaries(
    inputStr,
    bulkProcessing
  );
  let sortedSubstringInstancesObj = Object.assign(
    {},
    sortCalculatedSubstringInstances(subStringInstancesObj)['sorted_data']
  );
  storeCalculatedSubstringInstancesInFile(sortedSubstringInstancesObj);

  return sortedSubstringInstancesObj;
};

module.exports = {
  preprocess,
  sortCalculatedSubstringInstances,
  storeCalculatedSubstringInstancesInFile,
};
