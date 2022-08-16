import { expect } from "chai";
import fs from "node:fs";
import vm from "node:vm";

const path = "./src/background/background.js";

const code = fs.readFileSync(path).toString();
vm.runInThisContext(code);

describe("Background Tests", function () {
  let mockOptions = [];

  beforeEach(() => {
    mockOptions = Array.from(getDefaultOptions());
  });

  describe(".isNameInOptions()", function () {
    it("Should exist Function", function () {
      expect(isNameInOptions).to.not.undefined;
    });

    it("Should find 'ya_search' in the options", function () {
      expect(isNameInOptions(mockOptions, "ya_search")).to.be.true;
    });

    it("Should find nested name 'ya_fonts' in the options", function () {
      expect(isNameInOptions(mockOptions, "ya_fonts")).to.be.true;
    });

    it("Should not find the empty name in the options", function () {
      expect(isNameInOptions(mockOptions, null)).to.be.false;
    });

    it("Should not find the unknown name in the options", function () {
      expect(isNameInOptions(mockOptions, "unknown_name")).to.be.false;
    });
  });

  describe(".changeOptionState()", function () {
    it("Should exist Function", function () {
      expect(changeOptionState).to.be.not.undefined;
    });

    it("Should change 'ya_search' state to false", function () {
      const options = changeOptionState(mockOptions, "ya_search", false);
      expect(options[0].state).to.be.false;
    });

    it("Should change 'ya_search' state to true", function () {
      const options = changeOptionState(mockOptions, "ya_search", true);
      expect(options[0].state).to.be.true;
    });

    it("Should change 'ya_group_panels' state to false", function () {
      const options = changeOptionState(mockOptions, "ya_group_panels", false);
      expect(options[3].state).to.be.false;
    });

    it("Should change 'ya_group_panels' state to true", function () {
      const options = changeOptionState(mockOptions, "ya_group_panels", true);

      expect(options[3].state).to.be.true;
    });

    it("Should change a state of nested option 'ya_fonts' to true", function () {
      const options = changeOptionState(mockOptions, "ya_fonts", true);

      expect(options[2].items[0].state).to.be.true;
    });

    it("Should change a state of nested option 'ya_fonts' to false", function () {
      const options = changeOptionState(mockOptions, "ya_fonts", false);

      expect(options[2].items[0].state).to.be.false;
    });
  });

  describe(".filterOptionsByState()", function () {
    it("Should exist Function", function () {
      expect(filterOptionsByState).to.not.undefined;
    });

    it("Should filter the list only by state equals true", function () {
      const options = changeOptionState(mockOptions, "ya_fonts", true);
      const list = filterOptionsByState(options, true);

      expect(list).to.have.lengthOf(1);
      expect(list).to.have.members(["ya_fonts"]);
    });

    it("Should filter the list only by state equals false", function () {
      const list = filterOptionsByState(mockOptions, false);
      expect(list).to.have.lengthOf(5);
      expect(list).to.have.members([
        "ya_search",
        "ya_zen",
        "ya_fonts",
        "ya_font_size",
        "ya_side_panel",
      ]);
    });
  });

  describe(".convertOptions()", function () {
    it("Should exist Function", function () {
      expect(convertOptions).to.not.undefined;
    });

    it("Should return the default options when Null is passed", function () {
      expect(convertOptions(null)).to.be.instanceOf(Array);
    });

    it("Should return the default options on the empty object ", function () {
      expect(convertOptions({})).to.be.instanceOf(Array);
    });

    it("Should return the converted object", function () {
      mockOptions = {
        ya_search: false,
        ya_fonts: false,
        ya_font_size: false,
        ya_side_panel: false,
      };
      expect(convertOptions(mockOptions)).to.be.instanceOf(Array);
    });

    it("Should keep values of old object-like options ", function () {
      mockOptions = {
        ya_search: false,
        ya_fonts: true,
        ya_font_size: false,
        ya_side_panel: true,
      };
      let convertedList = convertOptions(mockOptions);

      expect(filterOptionsByState(convertedList, true)).to.be.lengthOf(2);
    });
  });
});
