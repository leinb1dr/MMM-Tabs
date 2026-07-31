import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { resolveResetTimeoutMs } from "../lib/reset-timeout.js"

describe("resolveResetTimeoutMs", () => {
  it("defaults to 60000 when value is undefined", () => {
    assert.equal(resolveResetTimeoutMs(undefined), 60000)
  })

  it("accepts a custom default when value is undefined", () => {
    assert.equal(resolveResetTimeoutMs(undefined, 30000), 30000)
  })

  it("returns positive timeout values as milliseconds", () => {
    assert.equal(resolveResetTimeoutMs(60000), 60000)
    assert.equal(resolveResetTimeoutMs(1500), 1500)
    assert.equal(resolveResetTimeoutMs("120000"), 120000)
  })

  it("disables reset for false, null, zero, and non-positive values", () => {
    assert.equal(resolveResetTimeoutMs(false), 0)
    assert.equal(resolveResetTimeoutMs(null), 0)
    assert.equal(resolveResetTimeoutMs(0), 0)
    assert.equal(resolveResetTimeoutMs(-1), 0)
    assert.equal(resolveResetTimeoutMs("0"), 0)
  })

  it("disables reset for non-finite numbers", () => {
    assert.equal(resolveResetTimeoutMs(Number.NaN), 0)
    assert.equal(resolveResetTimeoutMs(Number.POSITIVE_INFINITY), 0)
    assert.equal(resolveResetTimeoutMs("not-a-number"), 0)
  })
})
