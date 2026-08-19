import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("two-column identity", () => {
  it("does not subtract float, deferred tax, or opco debt", () => {
    const publicEq = 317.5e9;
    const cash = 359.23e9;
    const other = 17.034e9 + 0.461e9 + 8.5e9;
    const ops = 30.62e9 * 15;
    const insurance = 6.896e9 * 8;
    const parent = 20.364e9;
    const iv = publicEq + cash + other + ops + insurance - parent;
    const gaapLiab = 512.894e9;
    const float = 177.5e9;
    assert.ok(iv > 1.050e12 && iv < 1.4e12, "IV should be around $1.1–1.3T at 15×");
    assert.ok(iv + gaapLiab > iv * 1.3, "subtracting all GAAP liabilities would crush IV");
    assert.notEqual(iv, publicEq + cash + other + ops + insurance - gaapLiab);
    assert.ok(float > parent);
  });

  it("per-B is total IV / A-equivalents / 1500 — never IV / A-equivalents", () => {
    const classA = 488_450;
    const classB = 1_408_035_161;
    const aEq = classA + classB / 1500;
    const iv = 1_198_000_000_000;
    const perA = iv / aEq;
    const perB = perA / 1500;
    assert.ok(Math.abs(perB * aEq * 1500 - iv) < 1);
    assert.ok(perB > 520 && perB < 620, `expected ~$559/B, got ${perB}`);
    assert.ok(perA > 800_000, "A-equivalent IV is hundreds of thousands, not ~$800");
  });
});

describe("13F aggregation", () => {
  it("sums duplicate CUSIPs and treats values as dollars", () => {
    const xml = `<?xml version="1.0"?>
      <informationTable>
        <infoTable>
          <nameOfIssuer>APPLE INC</nameOfIssuer>
          <titleOfClass>COM</titleOfClass>
          <cusip>037833100</cusip>
          <value>1000000000</value>
          <shrsOrPrnAmt><sshPrnamt>2000000</sshPrnamt></shrsOrPrnAmt>
        </infoTable>
        <infoTable>
          <nameOfIssuer>APPLE INC</nameOfIssuer>
          <titleOfClass>COM</titleOfClass>
          <cusip>037833100</cusip>
          <value>500000000</value>
          <shrsOrPrnAmt><sshPrnamt>1000000</sshPrnamt></shrsOrPrnAmt>
        </infoTable>
        <infoTable>
          <nameOfIssuer>ALLY FINL INC</nameOfIssuer>
          <titleOfClass>COM</titleOfClass>
          <cusip>02005N100</cusip>
          <value>577211815</value>
          <shrsOrPrnAmt><sshPrnamt>12561737</sshPrnamt></shrsOrPrnAmt>
        </infoTable>
      </informationTable>`;
    const blocks = xml.match(/<(?:[\w.-]+:)?infoTable\b[\s\S]*?<\/(?:[\w.-]+:)?infoTable>/gi) ?? [];
    const by = new Map();
    for (const block of blocks) {
      const cusip = block.match(/<cusip>([^<]*)<\/cusip>/i)?.[1].toUpperCase();
      const shares = Number(block.match(/<sshPrnamt>([^<]*)<\/sshPrnamt>/i)?.[1]);
      const value = Number(block.match(/<value>([^<]*)<\/value>/i)?.[1]);
      const prev = by.get(cusip) ?? { shares: 0, value: 0 };
      by.set(cusip, { shares: prev.shares + shares, value: prev.value + value });
    }
    assert.equal(by.get("037833100").shares, 3_000_000);
    assert.equal(by.get("037833100").value, 1_500_000_000);
    assert.equal(by.get("02005N100").shares, 12_561_737);
  });
});

describe("cash preferred", () => {
  it("is I&O cash plus T-bills minus T-bill payable, not consolidated cash", () => {
    const cashIO = 35_096;
    const tBills = 324_905;
    const payable = 771;
    const rueCash = 5_513;
    const preferred = cashIO + tBills - payable;
    assert.equal(preferred, 359_230);
    assert.notEqual(preferred, cashIO + rueCash + tBills);
  });
});

describe("YTD annualization", () => {
  it("scales Q1 ×4, H1 ×2, 9-month ×4/3, full year ×1", () => {
    const ytd = 4_445;
    assert.equal(Math.round(ytd * (12 / 3)), 17_780);
    assert.equal(Math.round(ytd * (12 / 6)), 8_890);
    assert.equal(Math.round(ytd * (12 / 9)), 5_927);
    assert.equal(Math.round(ytd * (12 / 12)), 4_445);
  });
});
