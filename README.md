# Q1 Algo(pre-processing):
1) Remove special characters from summary
2) Split summary into individual words
3) Find frequecny of words extracted in a summary in all summaries and store them in an object(used object instead of map because keys here are only strings)
with properties instances, totalFrequency, total Instances and rank(few keywords such as adjectives are given fixed rank of 0.,
for others rank equals words length)
4) Repeat this process for all words of summaries
5) Once all the words are processed sort the instances of all keys in the objects
6) Store this object as cache in json format

# Q1 Algo(Query search):
1) read the cache.json file and data.json
2) store all summaries present in data.json file in a variable
3) if cache.json is empty, call preprocess fn to create cache file.,else parse the cache.json file
4) extract all possible substrings from user query of word lengths greater than or equal to 1
5) now calculate the extracted substrings instances in all summaries stored in allSummaries variable by first checking if a given substring
is present in cachewords then skip it.,else calculate the instances and store properties such as instances, totalFrequency, totalInstances and
rank(rank equals words length)
6) store all the substring instances in an object
7) create a map from the object created above
8) sort the map based on rank (keys with higher rank are given higher priority, if rank is equal then total frequency and total instances
are taken into consideration., if totalFrequency/totalInstances is higher it is given next priority)
9) loop throuh values of map and return the top k results

# Steps to run:
run command *node search.js* in terminal

# Q2 Note:
For Q2 the above search function is used as helper method to return the data from nodejs server and a few modifications were made
To fetch the matching data for user query: An API call is made /summaries endpoint with query text as query params and response is received in json format
