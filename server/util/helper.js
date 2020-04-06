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
    // remove additional whitespaces
    let trimmedQuery = trimAdditionalSpacesFromString(userQuery);

    // extract all possible substrings from userQuery
    let querySubstrings = getAllSubstringsFromUserQuery(trimmedQuery);

    //
    let allSortedSubstringInstancesObj = calculateAndSortInstancesOfQuerySubstringsInSummaries(
      querySubstrings
    );

    // create a map with all substring instances
    let allSubstringsInstancesMap = new Map(
      Object.entries(allSortedSubstringInstancesObj)
    );

    let allSortedSubstringsInstancesMap = sortSubstringInstancesMap(
      allSubstringsInstancesMap
    );

    let output = getMatchingResultsFromMap(
      allSortedSubstringsInstancesMap,
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

const calculateAndSortInstancesOfQuerySubstringsInSummaries = (
  querySubstrings
) => {
  let cacheWordsInstances = {};
  let instancesOfStringsNotInCacheWords = {};

  let instancesOfStringsNotInCacheWordsSorted = {};

  let allSubstringsInstances = {};

  querySubstrings.forEach((str) => {
    let lowercaseString = convertToLowercase(str);
    if (!cacheWords.hasOwnProperty(lowercaseString)) {
      //if the substring is not present in cache words
      let frequencyOfUserQuerySubstringInASummary; // stores the no of instances of a particula substring in a given summary
      allSummaries.forEach((summaryObj) => {
        // calculating the frequency for each summary
        let currStateOfUserQuerySubstringInstance = {};
        let totalFrequency, totalInstances;

        if (instancesOfStringsNotInCacheWords.hasOwnProperty(lowercaseString)) {
          // if object already contains substring
          currStateOfUserQuerySubstringInstance = Object.assign(
            {},
            instancesOfStringsNotInCacheWords[lowercaseString]['instances']
          ); // clone that objext
        }

        frequencyOfUserQuerySubstringInASummary =
          summaryObj['summary'].split(`${str}`).length - 1; //calculating frequency of substring in a summary

        if (frequencyOfUserQuerySubstringInASummary > 0) {
          //store only positive frequencies
          currStateOfUserQuerySubstringInstance[
            summaryObj['id']
          ] = frequencyOfUserQuerySubstringInASummary;
        }

        totalFrequency = Object.values(
          currStateOfUserQuerySubstringInstance
        ).reduce((a, b) => a + b, 0); // calculating the total frequency of a substring in all summaries
        totalInstances = Object.keys(currStateOfUserQuerySubstringInstance)
          .length; // calculating the total no of instances of a substring in all summaries

        instancesOfStringsNotInCacheWords[lowercaseString] = {
          instances: currStateOfUserQuerySubstringInstance,
          totalFrequency,
          totalInstances,
          // if total frequency is zero..assign zero rank else length of possible substring of given substring
          rank: totalFrequency === 0 ? -1 : lowercaseString.split(' ').length,
        }; // storing/updating substring instances, totalFrequency, total instances and assigning rank
      });
    } else {
      // susbstring already in cache words
      cacheWordsInstances[lowercaseString] = cacheWords[lowercaseString]; //storing it's data in an object
    }
  });

  if (!isEmptyObj(instancesOfStringsNotInCacheWords)) {
    // if there is any data that is not present in cachewords
    instancesOfStringsNotInCacheWordsSorted = preprocessHelpers.sortCalculatedSubstringInstances(
      instancesOfStringsNotInCacheWords
    )['sorted_data']; // sort the data and store it in object

    console.log('wrtiting data');
    //add unsaved data of instancesOfStringsNotInCacheWordsSorted to cache.json
    preprocessHelpers.storeCalculatedSubstringInstancesInFile(
      Object.assign(cacheWords, instancesOfStringsNotInCacheWordsSorted)
    );
  }

  // storing all substrings instances in an obj
  allSubstringsInstances = {
    ...cacheWordsInstances,
    ...instancesOfStringsNotInCacheWordsSorted,
  };

  return allSubstringsInstances;
};

const sortSubstringInstancesMap = (map) => {
  //sort the map by Rank >:: equal rank(higher) -> totalFrequency/totalInstances(higher)
  map[Symbol.iterator] = function* () {
    yield* [...this.entries()].sort(
      (a, b) =>
        b[1].rank - a[1].rank ||
        (a[1].totalFrequency &&
          b[1].totalFrequency &&
          a[1].totalFrequency / a[1].totalInstances -
            b[1].totalFrequency / b[1].totalInstances)
    );
  };
  return map;
};

const getMatchingResultsFromMap = (map, maxResults) => {
  // loop through values of map
  let searchResults = [];
  for (let [key, value] of map) {
    for (let j = 0; j < value['instances'].length; j++) {
      if (searchResults.length === maxResults) {
        // searchresults equals/exceeds maximum no of results break out of the loop
        break;
      }
      for (let k = 0; k < 1; k++) {
        if (
          !searchResults.some(
            (summary) => summary['id'] == value['instances'][j][k]
          ) // check if a particular book is already included in search results
        ) {
          //push result to search results
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
  return searchResults;
};

// check if object is empty
const isEmptyObj = (obj) => {
  for (var x in obj) {
    return false;
  }
  return true;
};

// This fuctions extracts all possible substrings of words length greater than or equal to 1

const getAllSubstringsFromUserQuery = (userQuery) => {
  userQuery = removeSpecialCharacters(userQuery);
  let oneWordUserQueryList = userQuery.split(' '); // split the user query at spaces
  let oneWordUserQueryListLength = oneWordUserQueryList.length;
  let i = 0;
  let userQuerySubStrings = [];
  while (i < oneWordUserQueryListLength) {
    let j = i;
    while (j < oneWordUserQueryListLength) {
      let substr = '';
      let substrRange = range(i, j + 1); // get the indexes range to loop to form substrings of more than 1 length
      substrRange.forEach((item) => {
        substr += oneWordUserQueryList[item] + ' '; // append item to substr
      });
      substr = substr.trim(); // remove extra white spaces
      userQuerySubStrings.push(substr); // push substr to userSubstrings
      j++;
    }
    i++;
  }
  return userQuerySubStrings;
};

module.exports = { searchSummaries };
