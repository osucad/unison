import { DocumentRuntime } from "./DocumentRuntime.js";

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export class IdGenerator
{
  constructor(readonly runtime: DocumentRuntime)
  {
  }

  next()
  {
    while (true) 
    {
      let id = "";

      for (let i = 0; i < 8; i++)
        id += characters[Math.floor(Math.random() * characters.length)];

      if (!this.runtime.getObject(id))
        return id;
    }
  }
}