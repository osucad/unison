import { DDS, SubmitLocalOpOptions } from "../dds/index.js";
import { DocumentRuntime } from "./DocumentRuntime.js";

class Transaction
{
  readonly entries: TransactionEntry[] = [];

  add(entry: TransactionEntry)
  {
    this.entries.unshift(entry);
  }

  isEmpty()
  {
    return this.entries.length === 0;
  }
}

interface TransactionEntry
{
  target: string;
  undoOp: unknown;
}

export class HistoryManager 
{

  commit(): boolean 
  {
    if (this.currentTransaction.isEmpty())
      return false;

    this.undoStack.push(this.currentTransaction);
    this.currentTransaction = new Transaction();

    return true;
  }

  undo() 
  {

    if (!this.currentTransaction.isEmpty())
      this.commit();

    const transaction = this.undoStack.pop();
    if (!transaction)
      return false;

    this.replayTransaction(transaction, this.redoStack);

    return true;
  }

  redo() 
  {
    if (!this.currentTransaction.isEmpty())
      return;

    const transaction = this.redoStack.pop();
    if (!transaction)
      return false;

    this.replayTransaction(transaction, this.undoStack);

    return true;
  }

  private replayTransaction(transaction: Transaction, targetStack: Transaction[])
  {
    try
    {
      this.isReplayingTransaction = true;

      for (const entry of transaction.entries)
        this.runtime.replayOp(entry.target, entry.undoOp);

      if (!this.currentTransaction.isEmpty()) 
      {
        targetStack.push(this.currentTransaction);
        this.currentTransaction = new Transaction();
      }
    }
    finally
    {
      this.isReplayingTransaction = false;
    }
  }
  
  private readonly undoStack: Transaction[] = [];
  private readonly redoStack: Transaction[] = [];

  private currentTransaction = new Transaction();
  private isReplayingTransaction = false;

  constructor(private readonly runtime: DocumentRuntime) 
  {
    runtime.on("localOp", this.onLocalOp, this);
  }


  private onLocalOp(dds: DDS | null, op: unknown, options: SubmitLocalOpOptions) 
  {
    if (!options.undo || !dds?.id)
      return;

    if (!this.isReplayingTransaction)
      this.redoStack.length = 0;

    this.currentTransaction.add({
      target: dds.id,
      undoOp: options.undo,
    });
  }
}

