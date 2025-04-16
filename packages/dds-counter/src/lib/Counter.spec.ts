import { Counter } from "./Counter.js";

describe("Counter", () => 
{
  it("creates valid summary", () => 
  {
    const counter = new Counter();

    counter.value = 3;

    expect(counter.createSummary()).toStrictEqual({ value: 3 });

    counter.value = -20;

    expect(counter.createSummary()).toStrictEqual({ value: -20 });
  });

  it("initializes from summary", () => 
  {
    const counter = new Counter();

    counter.load({ value: 5 });

    expect(counter.value).toBe(5);

    counter.load({ value: 100 });

    expect(counter.value).toBe(100);
  });
});