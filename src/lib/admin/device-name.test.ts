import { describe, expect, it } from "vitest";
import { deviceName } from "./device-name";

describe("deviceName", () => {
  it("names common browsers and systems", () => {
    expect(deviceName("Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36")).toBe("Chrome on Android");
    expect(deviceName("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1")).toBe(
      "Safari on iPhone or iPad",
    );
    expect(deviceName(null)).toBe("Unknown device");
  });
});
