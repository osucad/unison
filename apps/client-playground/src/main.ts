import { UnisonClient } from "@unison-client/core";
import { Beatmap, BeatmapMetadata } from "./Beatmap";

const client = new UnisonClient("http://localhost:3333");

const document = await client.create({
  schema: {
    beatmap: Beatmap,
  },
  types: [
    Beatmap,
    BeatmapMetadata,
  ]
});

const { beatmap } = document.root;
//      ^?