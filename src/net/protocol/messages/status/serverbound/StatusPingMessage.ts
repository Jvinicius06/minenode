// StatusPingMessage.ts - handle status ping messages
// Copyright (C) 2021 MineNode
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { MineBuffer } from "../../../../../../native/index";
import { MessageHandler } from "../../../../../net/protocol/Message";
import { ConnectionState } from "../../../../../server/Connection";
import { Player } from "../../../../../server/Player";
import Server from "../../../../../server/Server";
import StatusPongMessage from "../clientbound/StatusPongMessage";

export class StatusPingMessageHandler extends MessageHandler {
  public constructor(server: Server) {
    super({
      state: ConnectionState.STATUS,
      id: 0x01,
      label: "status request",
      server: server,
    });
  }

  public handle(buffer: MineBuffer, player: Player): void {
    const payload = buffer.readLong();

    const response = new StatusPongMessage(payload);
    player.sendPacket(response);

    this.server.logger.debug(`${player.connection.remote}: status ping (payload = ${payload})`);
  }
}
