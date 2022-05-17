const wordList = require("./BogusWords.json");

const profanityFilter = (string) => {
  return string
    .split(" ")
    .map((word) => {
      if (
        wordList.includes(
          word.toLowerCase().replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "")
        )
      ) {
        return "*".repeat(word.length);
      }
      return word;
    })
    .join(" ");
};

module.exports = profanityFilter;
