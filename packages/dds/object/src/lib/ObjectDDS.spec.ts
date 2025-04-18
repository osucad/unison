import { ObjectDDS } from "./ObjectDDS.js";
import { property } from "./decorator.js";
import { DDSAttributes } from "@unison/client-definitions";
import { TestRuntime } from "@unison/client-test-utils";

class TestObject extends ObjectDDS 
{
  public static readonly attributes: DDSAttributes = {
    type: "test",
  };

  constructor() 
  {
    super(TestObject.attributes);
  }

  @property()
  foo = "bar";
}

describe("ObjectDDS", () => 
{
  it("creates valid summary", () => 
  {
    const object = new TestObject();

    expect(object.createSummary()).toEqual({ foo: "bar" });
  });

  it("initializes from summary", () => 
  {
    const object = new TestObject();

    object.load({ foo: "baz" });

    expect(object.foo).toBe("baz");
  });

  it("marks changed properties as pending when in attached state", () => 
  {
    const object = new TestObject();

    object.foo = "baz";

    expect(object.kernel.getPendingState("foo")).toBe(false);

    object.attach("foo", new TestRuntime());

    object.foo = "foo";

    expect(object.kernel.getPendingState("foo")).toBe(true);
  });
});