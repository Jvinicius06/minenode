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

import * as uuidlib from "uuid";
import { Player } from "./Player";
import { Tickable } from "./Tickable";
import { WithUniqueId } from "./WithUniqueId";
import { WorldMember, World } from "./World";
import Server from "../server/Server";

export interface DimensionConfig {
  name: string;
  uuid?: string;
  seed?: number;
}

export class Dimension implements Tickable, WorldMember, WithUniqueId {
  public readonly world: World;
  public readonly name: string;
  public readonly uuid: string;
  public readonly seed: number;

  public readonly players: Set<Player> = new Set();

  public constructor(world: World, options: DimensionConfig) {
    this.world = world;
    this.name = options.name;
    this.uuid = options.uuid ?? uuidlib.v4();
    this.seed = options.seed ?? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  public static from(world: World, json: DimensionConfig) {
    return new Dimension(world, {
      name: json.name,
      seed: json.seed,
      uuid: json.uuid,
    });
  }

  public toJSON(): Required<DimensionConfig> {
    return {
      name: this.name,
      seed: this.seed,
      uuid: this.uuid,
    };
  }

  public init(): Promise<void> {
    return Promise.resolve();
  }

  public tick(tick: number): void {
    void tick; // TODO
  }

  public end(): Promise<void> {
    return Promise.resolve();
  }

  // Convenience methods

  public get server(): Server {
    return this.world.server;
  }
}

export interface DimensionMember {
  readonly dimension: Dimension;
}
