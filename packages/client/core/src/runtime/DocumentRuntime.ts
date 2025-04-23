import { EventEmitter } from "eventemitter3";
import { DDS, DDSAttributes } from "../dds/DDS.js";
import { DDSContext } from "../dds/DDSContext.js";
import { DDSFactory } from "../dds/DDSFactory.js";
import { nn } from "../utils/nn.js";
import { IdGenerator } from "./IdGenerator.js";
import { OpDecoder } from "./OpDecoder.js";
import { RuntimeEncoder } from "./RuntimeEncoder.js";
import { IObjectSummary } from "./Document.js";
import { IOperation } from "@unison/shared-definitions";

export interface DocumentRuntimeEvents 
{
  localOp(dds: DDS | null, op: unknown): void;

  attach(object: DDS): void;
}

export interface ICreateObjectOperation 
{
  type: "create";
  id: string;
  attributes: DDSAttributes;
  contents: unknown;
}

export class DocumentRuntime extends EventEmitter<DocumentRuntimeEvents> 
{
  private readonly _objects = new Map<string, DDSContext>();
  private readonly _ddsTypes = new Map<string, DDSFactory>;
  private readonly _idGenerator = new IdGenerator(this);

  readonly encoder = new RuntimeEncoder(this);

  constructor(types: readonly DDSFactory[] = [])
  {
    super();

    for (const type of types)
      this._ddsTypes.set(type.Attributes.type, type);
  }


  getObject(id: string): DDS | undefined 
  {
    return this._objects.get(id)?.target;
  }

  private _attach(dds: DDS, id?: string) 
  {
    if (dds.isAttached())
      return;

    id ??= this._idGenerator.next();

    const context = new DDSContext(this, id, dds);

    dds.attach(context);

    this._objects.set(id, context);

    this.emit("attach", dds);
  }

  private _create(typeOrAttributes: DDSAttributes | DDSFactory): DDS 
  {
    if (typeof typeOrAttributes === "function")
      return new typeOrAttributes();


    const ddsType = this._ddsTypes.get(typeOrAttributes.type);

    if (!ddsType)
      throw new Error(`Could not find dds type "${typeOrAttributes.type}"`);

    return new ddsType();
  }

  public create<T extends DDS>(ddsClass: DDSFactory<T>): T;
  public create(attributes: DDSAttributes): DDS;
  public create(typeOrAttributes: DDSAttributes | DDSFactory) 
  {
    const dds = this._create(typeOrAttributes);

    this.ensureAttached(dds);

    return dds;
  }

  public ensureAttached(dds: DDS) 
  {
    if (!dds.isAttached()) 
    {
      this._attach(dds);

      this.submitLocalOp(null, {
        type: "create",
        id: nn(dds.id),
        attributes: structuredClone(dds.attributes),
        contents: dds.createSummary(this.encoder)
      });
    }
  }

  public submitLocalOp(dds: DDS | null, op: unknown) 
  {
    this.emit("localOp", dds, op);
  }

  public process(ops: IOperation[], local: boolean)
  {
    const decoder = new OpDecoder(this);
    const lateInitFns: (() => void)[] = [];

    function flushLateInitFns() 
    {
      if (lateInitFns.length > 0) 
      {
        lateInitFns.forEach(it => it());
        lateInitFns.splice(0);
      }
    }

    for (const op of ops) 
    {
      if (op.target === null) 
      {
        if (local)
          continue;

        const { attributes, contents, id } = op.contents as ICreateObjectOperation;

        const dds = this._create(attributes);
        decoder.objects.set(id, dds);

        // objects may have circular references so we don't wanna load them until all of them are registered
        lateInitFns.push(() => 
        {
          dds.load(contents, decoder);
          this._attach(dds, id);
        });
        continue;
      }

      flushLateInitFns();

      const context = this._objects.get(op.target);

      context?.process(op.contents, local, decoder);
    }

    flushLateInitFns();
  }

  createSummary(
    entryPoint: readonly DDS[]
  ): Record<string, IObjectSummary>
  {
    const remainingObjects: DDS[] = [...entryPoint];
    const trackedObjects = new Set<DDS>(entryPoint);

    const encoder = new RuntimeEncoder(this);

    encoder.handleEncoded = (dds) => 
    {
      if (!trackedObjects.has(dds)) 
      {
        trackedObjects.add(dds);
        remainingObjects.push(dds);
      }
    };

    const summaries: Record<string, IObjectSummary> = {};

    while(remainingObjects.length > 0) 
    {
      const dds = nn(remainingObjects.shift());

      summaries[nn(dds.id)] = {
        attributes: structuredClone(dds.attributes),
        contents: dds.createSummary(encoder)
      };
    }

    return summaries;
  }

  load(entries: Record<string, IObjectSummary>) 
  {
    const decoder = new OpDecoder(this);

    for (const [id, summary] of Object.entries(entries)) 
    {
      const dds = this._create(summary.attributes);

      decoder.objects.set(id, dds);
    }

    for (const [id, summary] of Object.entries(entries)) 
    {
      const dds = nn(decoder.objects.get(id));

      dds.load(summary.contents, decoder);
      this._attach(dds, id);
    }
  }
}