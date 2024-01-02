const StyleDictionary = require("style-dictionary");
const _ = require("lodash");
const fs = require('fs');
const colorTokens = require("../packages/uswds-tokens/colors")

const USWDSTokens = StyleDictionary.extend({
  source: ["packages/uswds-tokens/colors/*.json"],
  platforms: {
    "scss/category": {
      transformGroup: "scss",
      buildPath: "packages/uswds-core/src/styles/tokens/color/",
      files: colorTokens.map((tokenCategory) => ({
        destination: `_${tokenCategory}.scss`,
        mapName: `system-color-${tokenCategory}`,
        format: "custom/format/color-map",
        filter: {
          attributes: {
            category: tokenCategory
          }
        }
      })),
    },
  },
})

USWDSTokens.registerFormat({
  name: 'custom/format/color-map',
  formatter: _.template(fs.readFileSync(`${__dirname  }/templates/scss-color-map.template`))
});

USWDSTokens.buildPlatform('scss/category');
