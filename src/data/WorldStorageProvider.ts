/* eslint-disable license-header/header */

import { Chunk } from "./Chunk";
import { Dimension } from "../world/Dimension";
import { World } from "../world/World";

export abstract class WorldStorageProvider {
  public abstract loadDimensions(world: World): Promise<Dimension[]>;
  // saveDimension(): Promise<void>;

  public abstract loadChunk(dimensionUUID: unknown, chunkX: number, chunkZ: number): Promise<Chunk | null>;
  public abstract saveChunk(dimensionUUID: unknown, chunkX: number, chunkZ: number, chunk: Chunk): Promise<void>;
}
