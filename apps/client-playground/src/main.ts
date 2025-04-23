import { UnisonClient } from "@unison-client/core";
import { Beatmap, BeatmapMetadata } from "./Beatmap";

const client = new UnisonClient("http://localhost:3333");

async function start() 
{
  if (location.pathname === "/")
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

    window.history.replaceState(undefined, "", `/${document.id}`);

    render(document.root.beatmap);
  }
  else 
  {
    const id = location.pathname.substring(1);

    const document = await client.load(id, {
      schema: {
        beatmap: Beatmap,
      },
      types: [
        Beatmap,
        BeatmapMetadata,
      ]
    });

    render(document.root.beatmap);
  }
}

function render(beatmap: Beatmap) 
{
  const { metadata } = beatmap;

  const label = document.createElement("label");
  label.innerText = "Value: ";

  document.body.appendChild(label);

  const input = document.createElement("input");
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

  document.body.appendChild(input);

}

void start();