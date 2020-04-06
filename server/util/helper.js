const fs = require('fs');
const preprocessHelpers = require('./preprocess.js');

let rawData = fs.readFileSync(__dirname + '/data.json');
let jsonData = JSON.parse(rawData);

let cacheData = fs.readFileSync(__dirname + '/cache.json');
let cacheWords;

if (cacheData.length != 0) cacheWords = JSON.parse(cacheData);
else {
  console.log('calling preprocess fn to make cache list');
  cacheWords = preprocessHelpers.preprocess();
}

let allSummaries = jsonData.summaries;
let allTitles = jsonData.titles;
let allAuthors = jsonData.authors;

const trimAdditionalSpacesFromString = (str) => {
  return str.trim();
};

const searchSummaries = (userQuery, numberOfResults) => {
  // check if query is emmpty or numberOfResults is less than or equal to zero
  if (userQuery === '' || numberOfResults <= 0) {
    // return empty data
    return [];
  } else {
    //load data from cache
    // extract all possible substrings from userQuery
    let trimmedQuery = trimAdditionalSpacesFromString(userQuery);

    let querySubstrings = getAllSubstringsFromUserQuery(trimmedQuery);

    let output = calculateInstancesOfQuerySubstringsInSummaries(
      querySubstrings,
      numberOfResults
    );
    return output;
  }
};

const removeSpecialCharacters = (str) => {
  return str.replace(/[^a-zA-Z ]/g, '');
};

const convertToLowercase = (input) => {
  return input.toLowerCase();
};

const range = (start, end) =>
  Array.from({ length: end - start }, (v, k) => k + start);

const calculateInstancesOfQuerySubstringsInSummaries = (
  querySubstrings,
  maxResults
) => {
  let searchResults = [];
  let cacheWordsInstances = {};
  let instancesOfStringsNotInCacheWords = {};

  let instancesOfStringsNotInCacheWordsSorted = {};

  let allSubstringsInstances = {};

  querySubstrings.forEach((str) => {
    let lowercaseString = convertToLowercase(str);
    if (!cacheWords.hasOwnProperty(lowercaseString)) {
      let frequencyOfUserQuerySubstringInASummary;
      allSummaries.forEach((summaryObj) => {
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
          rank: totalFrequency === 0 ? -1 : lowercaseString.split(' ').length,
        };
      });
    } else {
      cacheWordsInstances[lowercaseString] = cacheWords[lowercaseString];
    }
  });

  if (Object.keys(instancesOfStringsNotInCacheWords).length) {
    instancesOfStringsNotInCacheWordsSorted = preprocessHelpers.sortPreProcessedDataInstances(
      instancesOfStringsNotInCacheWords
    )['sorted_data'];

    allSubstringsInstances = {
      ...cacheWordsInstances,
      ...instancesOfStringsNotInCacheWordsSorted,
    };
  } else {
    allSubstringsInstances = { ...cacheWordsInstances };
  }

  let allSubstringsInstancesMap = new Map(
    Object.entries(allSubstringsInstances)
  );

  allSubstringsInstancesMap[Symbol.iterator] = function* () {
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
      if (searchResults.length === maxResults) {
        break;
      }
      for (let k = 0; k < 1; k++) {
        if (
          !searchResults.some(
            (summary) => summary['id'] == value['instances'][j][k]
          )
        ) {
          searchResults.push({
            id: allSummaries[value['instances'][j][k]]['id'],
            summary: allSummaries[value['instances'][j][k]]['summary'],
            title: allTitles[value['instances'][j][k]],
            author: allAuthors[value['instances'][j][k]]['author'],
          });
        }
      }
    }
  }

  if (!isEmptyObj(instancesOfStringsNotInCacheWords)) {
    console.log('wrtiting data');
    //add unsaved data of instancesOfStringsNotInCacheWordsSorted to cache.json
    preprocessHelpers.storePreProcessedDataInJSONToFile(
      Object.assign(cacheWords, instancesOfStringsNotInCacheWordsSorted)
    );
  }
  return searchResults;
};

const isEmptyObj = (obj) => {
  for (var x in obj) {
    return false;
  }
  return true;
};

// This fuctions extracts all possible substrings of words length greater than or equal to 1
// 1. split the user query at spaces

const getAllSubstringsFromUserQuery = (userQuery) => {
  userQuery = removeSpecialCharacters(userQuery);
  let oneWordUserQueryList = userQuery.split(' ');
  let oneWordUserQueryListLength = oneWordUserQueryList.length;
  let i = 0;
  let userQuerySubStrings = [];
  while (i < oneWordUserQueryListLength) {
    let j = i;
    while (j < oneWordUserQueryListLength) {
      let substr = '';
      let substrRange = range(i, j + 1);
      substrRange.forEach((item) => {
        substr += oneWordUserQueryList[item] + ' ';
      });
      substr = substr.trim();
      userQuerySubStrings.push(substr);
      j++;
    }
    i++;
  }
  return userQuerySubStrings;
};

module.exports = { searchSummaries };
