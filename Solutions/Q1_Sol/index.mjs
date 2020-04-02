import { readFileSync, readFile, fstat, writeFile } from 'fs';
import { preprocess, sortPreProcessedDataInstances } from './preprocess.mjs';
// import cache from './cache.json';

let rawData = readFileSync('data.json');
let jsonData = JSON.parse(rawData);

let cacheData = readFileSync('./cache.json');
let cacheWords;

let allSummaries = jsonData.summaries;

if (cacheData.length != 0) cacheWords = JSON.parse(cacheData);
else {
  console.log('calling preprocess fn to make cache list');
  cacheWords = preprocess();
}
// console.log('cached words: ', cacheWords);
let maxResults = 3;

let userQuerySubStrings = [];

let cacheWordsInstances = {};

let instancesOfStringsNotInCacheWords = {};

let instancesOfStringsNotInCacheWordsSorted = {};

let allSubstringsInstances = {};

let newArr = [];

export const searchSummaries = (userQuery, numberOfResults) => {
  // check if query is emmpty or numberOfResults is less than or equal to zero
  if (userQuery === '' || numberOfResults <= 0) {
    // return empty data
    return [];
  } else {
    //load data from cache
    // extract all possible substrings from userQuery
    getAllSubstringsFromUserQuery(userQuery);

    calculateInstancesOfQuerySubstringsInSummaries();

    console.log(JSON.stringify(newArr));
  }
};

const removeSpecialCharacters = str => {
  return str.replace(/[^a-zA-Z ]/g, '');
};

const convertToLowercase = input => {
  return input.toLowerCase();
};

const range = (start, end) =>
  Array.from({ length: end - start }, (v, k) => k + start);

const calculateInstancesOfQuerySubstringsInSummaries = () => {
  userQuerySubStrings.forEach(str => {
    let lowercaseString = convertToLowercase(str);
    if (!cacheWords.hasOwnProperty(lowercaseString)) {
      let frequencyOfUserQuerySubstringInASummary;
      allSummaries.forEach(summaryObj => {
        let currStateOfUserQuerySubstringInstance = {};
        let totalFrequency, totalInstances;

        if (instancesOfStringsNotInCacheWords.hasOwnProperty(lowercaseString)) {
          currStateOfUserQuerySubstringInstance = Object.assign(
            {},
            instancesOfStringsNotInCacheWords[lowercaseString]['instances']
          );
        }
        frequencyOfUserQuerySubstringInASummary =
          summaryObj['summary'].split(`${str}`).length - 1;
        if (frequencyOfUserQuerySubstringInASummary > 0) {
          currStateOfUserQuerySubstringInstance[
            summaryObj['id']
          ] = frequencyOfUserQuerySubstringInASummary;
        }

        totalFrequency = Object.values(
          currStateOfUserQuerySubstringInstance
        ).reduce((a, b) => a + b, 0);
        totalInstances = Object.keys(currStateOfUserQuerySubstringInstance)
          .length;

        instancesOfStringsNotInCacheWords[lowercaseString] = {
          instances: currStateOfUserQuerySubstringInstance,
          totalFrequency,
          totalInstances,
          rank: totalFrequency === 0 ? -1 : lowercaseString.split(' ').length
        };
      });
    } else {
      cacheWordsInstances[lowercaseString] = cacheWords[lowercaseString];
    }
  });

  if (Object.keys(instancesOfStringsNotInCacheWords).length) {
    instancesOfStringsNotInCacheWordsSorted = sortPreProcessedDataInstances(
      instancesOfStringsNotInCacheWords
    )['sorted_data'];

    allSubstringsInstances = {
      ...cacheWordsInstances,
      ...instancesOfStringsNotInCacheWordsSorted
    };
  } else {
    allSubstringsInstances = { ...cacheWordsInstances };
  }

  let allSubstringsInstancesMap = new Map(
    Object.entries(allSubstringsInstances)
  );

  allSubstringsInstancesMap[Symbol.iterator] = function*() {
    yield* [...this.entries()].sort(
      (a, b) =>
        b[1].rank - a[1].rank ||
        (a[1].totalFrequency &&
          b[1].totalFrequency &&
          a[1].totalFrequency / a[1].totalInstances -
            b[1].totalFrequency / b[1].totalInstances)
    );
  };

  for (let [key, value] of allSubstringsInstancesMap) {
    for (let j = 0; j < value['instances'].length; j++) {
      if (newArr.length === maxResults) {
        break;
      }
      for (let k = 0; k < 1; k++) {
        if (
          !newArr.some(summary => summary['id'] == value['instances'][j][k])
        ) {
          newArr.push(allSummaries[value['instances'][j][k]]);
        }
      }
    }
  }

  if (instancesOfStringsNotInCacheWords) {
    //add unsaved data of instancesOfStringsNotInCacheWordsSorted to cache.json
    writeFile(
      'cache.json',
      JSON.stringify(
        Object.assign(cacheWords, instancesOfStringsNotInCacheWordsSorted)
      ),
      function(err) {
        if (err) throw err;
      }
    );
  }
};

// This fuctions extracts all possible substrings of words length greater than or equal to 1
// 1. split the user query at spaces

const getAllSubstringsFromUserQuery = userQuery => {
  userQuery = removeSpecialCharacters(userQuery);
  let oneWordUserQueryList = userQuery.split(' ');
  let oneWordUserQueryListLength = oneWordUserQueryList.length;
  let i = 0;
  while (i < oneWordUserQueryListLength) {
    let j = i;
    while (j < oneWordUserQueryListLength) {
      let substr = '';
      let substrRange = range(i, j + 1);
      substrRange.forEach(item => {
        substr += oneWordUserQueryList[item] + ' ';
      });
      substr = substr.trim();
      userQuerySubStrings.push(substr);
      j++;
    }
    i++;
  }
};

searchSummaries('is your, problems', 3);
