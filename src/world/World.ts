/*
 * Copyright (C) 2022 MineNode
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { writeFileSync } from "fs";
import { Dimension } from "./Dimension";
import { Player } from "./Player";
import { Tickable } from "./Tickable";
import { MineBuffer, Vec2, Vec3 } from "../../native";
import { FSWorldStorageProvider } from "../StorageProviders/FSWorldStorage";
import { Chunk } from "../data/Chunk";
import { WorldStorageProvider } from "../data/WorldStorageProvider";
import {
  PlayClientboundChunkDataMessage,
  PlayClientboundChunkDataMessageOptions,
} from "../net/protocol/messages/play/clientbound/PlayClientboundChunkDataMessage";
import Server from "../server/Server";
import { Difficulty } from "../utils/Enums";
import { parallel } from "../utils/SetUtils";

export interface WorldOptions {
  difficulty?: Difficulty;
  difficultyLocked?: boolean;
  isHardcore?: boolean;
  name: string;
  worldStorageProvider?: WorldStorageProvider;
  savingInterval?: number;
}

export class World implements Tickable {
  public readonly server: Server;
  public readonly dimensions: Set<Dimension> = new Set();

  private _difficulty: Difficulty;
  public readonly difficultyLocked: boolean;
  public readonly isHardcore: boolean;
  public readonly name: string;

  public readonly worldStorageProvider?: WorldStorageProvider;
  public readonly savingInterval: number;

  public get difficulty(): Difficulty {
    return this._difficulty;
  }

  public set difficulty(difficulty: Difficulty) {
    if (this.difficultyLocked) {
      throw new Error("Difficulty is locked");
    }
    this._difficulty = difficulty;
    void parallel(this.players(), player => player.sendDifficulty(difficulty));
  }

  public constructor(
    server: Server,
    options: WorldOptions = {
      name: "World",
      worldStorageProvider: new FSWorldStorageProvider({
        path: "worldData",
      }),
    },
  ) {
    this.server = server;
    this._difficulty = options.difficulty ?? Difficulty.PEACEFUL;
    this.difficultyLocked = options.difficultyLocked ?? false;
    this.isHardcore = options.isHardcore ?? false;
    this.savingInterval = options.savingInterval ?? 10000;
    this.worldStorageProvider = options.worldStorageProvider;
    this.name = options.name;

    this.sendWolrd();
  }

  public sendWolrd() {
    // Exemplo de criação de um Chunk com uma camada de terra (dirt)
    const chunkLocation: Vec2 = new Vec2(0, 0);
    // Dados de altura do Chunk (simplificado)
    const heightMap = {
      MOTION_BLOCKING: new Array(37).fill(BigInt(0n)), // Altura do bloco (simplificado)
      WORLD_SURFACE: new Array(37).fill(BigInt(0n)), // Altura do bloco (simplificado)
    };

    const chunkData = new Chunk({
      minY: -64,
      worldHeight: 384,
    });

    for (let y = -64; y < 77 - 64; y++) {
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunkData.setBlockType(new Vec3(x, y, z), 1);
          chunkData.setBlockLight(new Vec3(x, y, z), 15);
          chunkData.setBiome(new Vec3(x, y, z), 1);
        }
      }
    }

    const trustEdges = false;
    const skyLightMask = 0x0; // Para simplificação, não há dados de luz
    const blockLightMask = 0x0; // Para simplificação, não há dados de luz
    const emptySkyLightMask = 0x0; // Para simplificação, não há dados de luz
    const emptyBlockLightMask = 0x0; // Para simplificação, não há dados de luz
    const skyLight = new Uint8Array(2048).fill(0); // Para simplificação, todos os bits de luz são 1
    const blockLight = new Uint8Array(2048).fill(0); // Para simplificação, todos os bits de luz são 1
    const chunkDataPacket: PlayClientboundChunkDataMessageOptions = {
      chunkLocation,
      heightMap,
      data: chunkData,
      trustEdges,
      skyLightMask,
      blockLightMask,
      emptySkyLightMask,
      emptyBlockLightMask,
      skyLight,
      blockLight,
    };
    const pp = new PlayClientboundChunkDataMessage(chunkDataPacket);

    const buffer = new MineBuffer();
    pp.encode(buffer);
    writeFileSync("debug/testeChunk.dat", buffer.getBuffer());
    writeFileSync("debug/chunkDump/testeChunk.dat", buffer.getBuffer());
    // await this.connection.writeMessage();
  }

  public async init(): Promise<void> {
    if (this.worldStorageProvider) {
      const dis = await this.worldStorageProvider.loadDimensions(this);
      dis.forEach(e => this.dimensions.add(e));
    } else {
      // TODO: temporary
      const mainWorldOverworld = new Dimension(this, { name: "overworld" });
      this.dimensions.add(mainWorldOverworld);
    }
  }

  public end(): void {
    void 0;
  }

  public async tick(tick: number): Promise<void> {
    await Promise.resolve(void tick);
  }

  // Convenience methods

  public *players(): Iterable<Player> {
    for (const dimension of this.dimensions) {
      for (const player of dimension.players) {
        yield player;
      }
    }
  }

  public getDimension(name: string): Dimension | undefined {
    for (const dimension of this.dimensions) {
      if (dimension.name === name) {
        return dimension;
      }
    }
    return undefined;
  }
}

export interface WorldMember {
  readonly world: World;
}
