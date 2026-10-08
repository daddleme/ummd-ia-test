import { test } from "node:test";
import assert from "node:assert/strict";
import { popupOffset, panelOffset } from "../src/layout.js";

test("Dropdown rückt nach links, wenn es rechts hinausliefe", () => {
  assert.equal(popupOffset(100, 200, 1000), 0);
  assert.equal(popupOffset(900, 200, 1000), -100);
});

test("Spaltenleiste bleibt im Fenster", () => {
  assert.equal(panelOffset(600, 1000), 0);
  assert.equal(panelOffset(1200, 1000), -200);
});
