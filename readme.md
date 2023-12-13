# Drunken Duck Webscraper

A webscraper project devoted to identifying alcoholic brand names, and their manufactures.


# Current state

Creates a json array of objects with a brand name, manufacture, and distributor.

## How to use it

1. Create a `.env` file with your open ai key in it

```
OPENAI_API_KEY="YOUR KEY"
```

2. Install npm dependencies 
    -  If you don't already have node js installed, install it.
3. Do the thing:

```bash
npm start
```

```bash
npm install
```



# Problem

Named entity recognition is a relatively solved problem, but
it is difficult to determine whether or not an identified entity is
an alcoholic brand, a manufacture, or neither.
There is not a well known dataset of alcoholic brands
and their manufactures to my knowledge.

With out a dataset, we cannot train a classifier.

Additionally, the brand name and the manufacture may not always occur in the same document.
When they do, it is not garenteed that they occur adjacent or even close to them in the document.


# Methodology

Give named entity recognition is a solvable problem, we propose the following
solution while making a few assumptions.

## Assumptions

We make some assumptions in our language:
- Folder hierarchies for saved search results are named for:
  - the data being saved (text or html), the search term, then the page number
- We save the content of every webpage locally in a folder
  named for the page number in a parent folder named for the search term.
- We save the text content of every webpage locally in a folder named for the term.
- We always use json mode for open open AI LLMs
- We don't repeat a search query
- We track how many pages into a search terms results we've saved
- When we make a search request, we return the

## Overview

Starting from a list of search terms that should contain references to
alcoholic beverages, their manufacture, and/or their distributors,
itteratively extract named entities using a preexisting solution.

From the list of named entities, for each entity class we are interested in
using gpt3.5, screen the search results into 10 different arrays,
divided by likelyhood percentile of the entity belonging to the desired class.

working from most likely to least itterate through each percentile and
generate 3 new lists of search terms from each by appending
the named entity with the name of each of the 3 classes we are interested in.


## Step 0: Generating seed terms

Initialize the app with a few seed search terms related to alcohol.

Generate a json list of search terms that could
Some examples of search terms that might contain references to alcoholic
drinks or their manufactures are:

- Alcoholic drinks
- Alcoholic Beverages
- Beverages containing alcohol
- List of alcoholic drinks
- List of alcoholic drinks
- List of alcoholic beverage manufactures
- List of alcoholic beverage distributors

## Step 1: Scraping

### search terms

### Seed the dataset

using the seed terms that produce a wide variety
of different beverages from different brands.

### Negating known named entities from the search

If the search is performed and there,
generate new search terms from the original ones with the entities negated
using search operators.

Once no new entities are found, new search terms must be provided.

### First pass

We will traverse the search results of duck duck go to start
gathering websites that might contain alcoholic beverages.

## Negate
After a small dataset of brands and manufactures has been produced,
use them to produce a new search query based on the original, not including
any of entities.

We can repeat this process a few times until we stop finding new entities.

We can use multiple incomplete methods to narrow down our results for both classes,
then sort through the remaining data by hand.

## Potential inpartial solutions to identify named entity class

### very likely to work

- prompt an LLM to screen entities extracted from search terms, requesting them to be
  grouped into percentiles based on it's certainty.

- from a list of documents known to contain a term associated with a screened set of entities
  create a statistical model using an out of the box solution.
  - Set aside a small set of entities from this set for validation of the model
  - Screen the complete set of named entities for entities not belonging to any
    class to create a 4th class of "irrelavent" entities.
  - Generate a list of random strings to create a 5th class called "noise"

### Probably won't work
- using a list of screened entities, search for the named entity plus a class name.
  - count the number of times the class name or related terms

## Potential solutions to group terms

- Prompt an LLM to determine if a grouping of beverage, manufacture, and distributor
  are correct. Itteratively combine entities into strings seperated by spaces.

- Prompt an LLM to determine if a grouping of beverage, manufacture, and distributor
  are correct, likely correct, maybe correct, uncertain, maybe wrong, 
  likely wrong, and definately wrong. Itteratively combine entities into strings 
  seperated by spaces.

- from a list of documents known to contain a term associated with a screened set of data
  create a statistical model using an out of the box solution.
  - Set aside a small set of entities from this set for validation of the model
  - Generate some combined terms with the individul albels being correct 
    to create a set of incorrectly associated
    entities.
  - Generated some
  

## classifying named entities

using an LLM with an appropriate prompt and a list of named entities, we can screen for entities which are obviously in a given class.



# Goals

1. collect a comprehensive list of all ready to drink alcoholic beverages on the market,
  and their distributors.
2. save the data as a CSV file with these columns.
   1. Brand name (string)
      - required
   2. Type (string)
   3. Distributor/Manufacture (string)
      - required
   4. Introduced (timestamp)
   5. Location of Origin (string)
   6. Alcohol By Volume (float between 1 and 0)
   7. website url (string)


# variables

## Configuration

Constant variables that determine the behavior of the webcrawler

- The search term to be used to start the search
- limit for number of beverages.
- limit number of pages searched through on search engine
- limit the number of results in each page of search results
- name of file output, defaulting to `drunk.json`

## Data containers
The following titles denote the class of the variable
Initalize each with an appropriate value.

### arrays

- brandnames
- manufactures

### Sets

- visited websites
- Known brandnames
- Known Manufactures

# Assumptions

use duck duck go as a search engine
Use the search term:
  "Comprehensive list of all alcoholic beverage brands and their distributors"
There is no existing model specifically for extracting specifically this data
There is an open ai key in the env vars

The program should execute as follows:
1. Initative search on duck duck go
2. Retrieve the contents of each webpage in the search, then add the url to a set of already visited websites.
3. Extract the text content of each website
4. Perform named entity recognition on the text
5. if there are any named entities found, use the gpt 3.5 api
  from open ai to filter out any element that is likely not a brand of alcoholic beverage
   - use the json object option
   - Use the prompt template `Filter from this list any item that is not an alcoholic beverage brand:`
   - Append to the prompt as a json array string the list of named entities.
   - try to parse the json string. If an error occurs, catch it. Do nothing and continue.
   - if the result is not empty, 
