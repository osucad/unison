import { DDS, DDSAttributes } from "../DDS.js";
import { IObjectDDSSummary, ObjectDDSKernel } from "./ObjectDDSKernel.js";

export abstract class ObjectDDS extends DDS {
  private readonly kernel: ObjectDDSKernel

  protected constructor(attributes: DDSAttributes) {
    super(attributes);

    this.kernel = new ObjectDDSKernel(this)
  }

  public override createSummary(): unknown {
    return this.kernel.createSummary();
  }

  public override load(contents: unknown) {
    this.kernel.load(contents as IObjectDDSSummary)
  }
}