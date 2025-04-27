import { DocumentRuntime } from "../runtime/DocumentRuntime.js";
import { RuntimeEncoder } from "../runtime/RuntimeEncoder.js";
import { IDecoder, IEncoder } from "../serialization/index.js";
import { DDS } from "./DDS.js";

export class DDSContext 
{
  constructor(
    readonly runtime: DocumentRuntime,
    readonly id: string,
    readonly target: DDS,
  ) 
  {
    this.encoder = new RuntimeEncoder(this.runtime);
  }

  readonly encoder: IEncoder;

  submitLocalOp(op: unknown, options?: SubmitLocalOpOptions)
  {
    this.runtime.submitLocalOp(this.target, op, options);
  }

  public process(contents: unknown, local: boolean, decoder: IDecoder) 
  {
    this.target.process(contents, local, decoder);
  }

  public replayOp(contents: unknown, decoder: IDecoder)
  {
    this.target.replayOp(contents, decoder);
  }
}

export interface SubmitLocalOpOptions 
{
  undo?: unknown;
}