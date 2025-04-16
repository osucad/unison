import { DDSAttributes } from "@unison/client-definitions";
import { DDS } from "@unison/dds-base";
import { IObjectDDSSummary, ObjectDDSKernel } from "./ObjectDDSKernel.js";
import { toProxy } from "./proxy.js";

export abstract class ObjectDDS extends DDS {
  /**
   * @internal
   */
  readonly kernel: ObjectDDSKernel;

  protected constructor(attributes: DDSAttributes) {
    super(attributes);

    this.kernel = new ObjectDDSKernel(this);

    return toProxy(this);
  }

  public override createSummary(): unknown {
    return this.kernel.createSummary();
  }

  public override load(contents: unknown) {
    this.kernel.load(contents as IObjectDDSSummary);
  }
}