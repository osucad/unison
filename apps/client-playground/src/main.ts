import { UnisonClient, Document } from "@unison-client/core";
import { Beatmap, BeatmapMetadata } from "./Beatmap";
import html from "nanohtml";

const client = new UnisonClient("http://localhost:3333");

async function start() 
{
  if (!location.hash)
  {
    const document = await client.createDocument({
      schema: {
        beatmap: Beatmap,
      },
      types: [
        Beatmap,
        BeatmapMetadata,
      ]
    });

    location.hash = document.id!;

    render(document, document.root.beatmap);
  }
  else 
  {
    const document = await client.load(location.hash.substring(1), {
      schema: {
        beatmap: Beatmap,
      },
      types: [
        Beatmap,
        BeatmapMetadata,
      ]
    });

    render(document, document.root.beatmap);
  }
}

function render(document: Document, beatmap: Beatmap)
{
  const { metadata } = beatmap;

  const el = html`
    <div>
        <label>Value: </label>
        <input type="text" onchange=${() => document.history.commit()}>
    </div>
    <div>
        <button onclick=${() => document.history.undo()}>Undo</button>
        <button onclick=${() => document.history.redo()}>Redo</button>
    </div>
  `;

  window.document.body.append(el);

  const input = window.document.querySelector("input")!;
  input.value = beatmap.metadata.artist;

  input.oninput = () => 
  {
    metadata.artist = input.value;
  };

  metadata.on("changed", (property, newValue) =>
  {
    if (property === "artist")
      input.value = metadata.artist;
  });
}

void start();