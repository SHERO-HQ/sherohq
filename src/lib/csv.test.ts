import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes commas, quotes and line breaks", () => {
    expect(toCsv(["a", "b"], [["x, y", 'say "hi"'], ["line\nbreak", null]])).toBe(
      '﻿a,b\r\n"x, y","say ""hi"""\r\n"line\nbreak",\r\n',
    );
  });

  it("keeps formula-looking cells as text", () => {
    expect(toCsv(["a"], [["=HYPERLINK(1)"], ["+233241234567"]])).toBe("﻿a\r\n'=HYPERLINK(1)\r\n'+233241234567\r\n");
  });
});
