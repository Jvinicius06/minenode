/* eslint-disable license-header/header */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { readFile } from "fs/promises";
import { join } from "path";
import { Chunk } from "../data/Chunk";
import { WorldStorageProvider } from "../data/WorldStorageProvider";
import { Dimension, DimensionConfig } from "../world/Dimension";
import { World } from "../world/World";

export interface FSWorldStorageProviderConfig {
  path: string;
}

export class FSWorldStorageProvider implements WorldStorageProvider {
  protected path: string;

  public constructor(config: FSWorldStorageProviderConfig) {
    this.path = config.path;
  }

  public async loadDimensions(world: World): Promise<Dimension[]> {
    try {
      const file = await readFile(join(this.path, `${world.name}.json`), { encoding: "utf-8" });
      const data = JSON.parse(file) as DimensionConfig[];
      return await Promise.resolve(data.map(e => Dimension.from(world, e)));
    } catch (error) {}
    return Promise.resolve([]);
  }

  public async loadChunk(dimensionUUID: string, chunkX: number, chunkZ: number): Promise<Chunk | null> {
    return Promise.resolve(null);
  }

  public saveChunk(dimensionUUID: string, chunkX: number, chunkZ: number, chunk: Chunk): Promise<void> {
    return Promise.resolve();
  }
}
