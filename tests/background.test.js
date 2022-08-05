import { expect } from "chai";
import fs from "node:fs";
import vm from "node:vm";

const path = "./src/background/background.js";

const code = fs.readFileSync(path);
vm.runInThisContext(code);

describe("Background", function () {
  describe(".isNameInOptions()", function () {
    it("Should exist Function", function () {
      expect(isNameInOptions).to.not.undefined;
    });

    it("Should exist .DEFAULT_OPTIONS", function () {
      expect(DEFAULT_OPTIONS).to.not.undefined;
    });

    it("Should find 'ya_search' in the options", function () {
      expect(isNameInOptions(DEFAULT_OPTIONS, "ya_search")).to.be.true;
    });

    it("Should find nested name 'ya_fonts' in the options", function () {
      expect(isNameInOptions(DEFAULT_OPTIONS, "ya_fonts")).to.be.true;
    });

    it("Should not find the empty name in the options", function () {
      expect(isNameInOptions(DEFAULT_OPTIONS, null)).to.be.false;
    });

    it("Should not find the unknown name in the options", function () {
      expect(isNameInOptions(DEFAULT_OPTIONS, "unknown_name")).to.be.false;
    });
  });

  describe(".changeOptionState()", function () {
    it("Should exist Function", function () {
      expect(changeOptionState).to.be.not.undefined;
    });

    it("Should exist .DEFAULT_OPTIONS", function () {
      expect(DEFAULT_OPTIONS).to.not.undefined;
    });

    it("Should change 'ya_search' state to false", function () {
      const options = changeOptionState(DEFAULT_OPTIONS, "ya_search", false);
      expect(options[0].state).to.be.false;
    });

    it("Should change 'ya_search' state to true", function () {
      const options = changeOptionState(DEFAULT_OPTIONS, "ya_search", true);
      expect(options[0].state).to.be.true;
    });

    it("Should change 'ya_group_panels' state to false", function () {
      const options = changeOptionState(
        DEFAULT_OPTIONS,
        "ya_group_panels",
        false
      );
      expect(options[3].state).to.be.false;
    });

    it("Should change 'ya_group_panels' state to true", function () {
      const options = changeOptionState(
        DEFAULT_OPTIONS,
        "ya_group_panels",
        true
      );

      expect(options[3].state).to.be.true;
    });

    it("Should change a state of nested option 'ya_fonts' to true", function () {
      const options = changeOptionState(DEFAULT_OPTIONS, "ya_fonts", true);

      expect(options[2].items[0].state).to.be.true;
    });

    it("Should change a state of nested option 'ya_fonts' to false", function () {
      const options = changeOptionState(DEFAULT_OPTIONS, "ya_fonts", false);

      expect(options[2].items[0].state).to.be.false;
    });
  });

  describe(".filterOptionsByState()", function () {
    it("Should exist Function", function () {
      expect(filterOptionsByState).to.not.undefined;
    });

    it("Should exist .DEFAULT_OPTIONS", function () {
      expect(DEFAULT_OPTIONS).to.not.undefined;
    });

    it("Should filter the list only by state equals true", function () {
      const list = filterOptionsByState(DEFAULT_OPTIONS, true);
      expect(list).to.have.lengthOf(2);
      expect(list).to.have.members(["ya_group_fonts", "ya_group_panels"]);
    });

    it("Should filter the list only by state equals false", function () {
      const list = filterOptionsByState(DEFAULT_OPTIONS, false);
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
});
