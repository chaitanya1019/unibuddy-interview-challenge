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
  }
};

const removeSpecialCharacters = str => {
  return str.replace(/[^a-zA-Z ]/g, '');
};

const range = (start, end) =>
  Array.from({ length: end - start }, (v, k) => k + start);

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
