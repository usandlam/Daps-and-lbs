const regex = /([\u180B-\u180D\uFE00-\uFE0F]|\uDB40[\uDD00-\uDDEF])/g;

const stripVariationSelectors = function (string) {
  return string.replace(regex, "");
};

module.exports = stripVariationSelectors;
