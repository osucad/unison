import { DDSAttributes, ObjectDDS, property } from "@unison-client/core";

export class Beatmap extends ObjectDDS 
{
  static readonly Attributes: DDSAttributes = {
    type: "@osucad/beatmap"
  };

  constructor() 
  {
    super(Beatmap.Attributes);
  }

  @property()
  metadata = new BeatmapMetadata();
}

export class BeatmapMetadata extends ObjectDDS 
{
  static readonly Attributes: DDSAttributes = {
    type: "@osucad/beatmap-metadata"
  };

  constructor()
  {
    super(BeatmapMetadata.Attributes);
  }

  @property()
  artist = "";

  @property()
  artistUnicode = "";

  @property()
  title = "";

  @property()
  titleUnicode = "";
}