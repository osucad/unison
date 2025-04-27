import { IDecoder, IEncoder } from "../../serialization/index.js";
import { DDS, DDSAttributes, DDSEvents } from "../DDS.js";
import { DDSContext } from "../DDSContext.js";
import { IObjectDDSSummary, IObjectMessage, ObjectDDSKernel } from "./ObjectDDSKernel.js";

export interface ObjectEvents extends DDSEvents 
{
  changed(key: string, newValue: unknown): void;
}

export abstract class ObjectDDS extends DDS<ObjectEvents>
{
  readonly kernel: ObjectDDSKernel;

  protected constructor(attributes: DDSAttributes) 
  {
    super(attributes);

    this.kernel = new ObjectDDSKernel(this);

    return this.kernel.getProxy();
  }

  override createSummary(encoder: IEncoder): unknown 
  {
    return this.kernel.createSummary(encoder);
  }

  public override load(summary: unknown, decoder: IDecoder) 
  {
    this.kernel.load(summary as IObjectDDSSummary, decoder);
  }

  public override attach(context: DDSContext) 
  {
    super.attach(context);

    this.kernel.attach(context);
  }

  public override detach() 
  {
    super.detach();

    this.kernel.detach();
  }

  public override process(contents: unknown, local: boolean, decoder: IDecoder)
  {
    this.kernel.process(contents as IObjectMessage,local, decoder);
  }

  public override replayOp(contents: unknown, decoder: IDecoder) 
  {
    this.kernel.replayOp(contents as IObjectMessage, decoder);
  }
}