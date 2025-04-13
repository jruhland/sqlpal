import type { z } from "zod";
import type { Driver } from "~/lib/drivers/driver.server";
import { PostgresDriver } from "~/lib/drivers/postgres.server";
import type { connectionSchemas } from "~/modules/connections";
import { SQLiteDriver } from "./drivers/sqlite.server";

export type ConnectionConfig = z.infer<typeof connectionSchemas>;

class ConnectionManager {
  private connections: { [key: string]: Driver } = {};

  async getConnection(id: string, config: ConnectionConfig) {
    if (this.connections[id]) {
      return this.connections[id];
    }

    switch (config.driver) {
      case "postgres": {
        const conn = new PostgresDriver(id, config);
        this.connections[id] = conn;
        return conn;
      }

      // case "mysql": {
      //   const pool = createPool({
      //     host: config.host,
      //     port: config.port,
      //     database: config.database,
      //     user: config.username,
      //     password: config.password,
      //   });
      //   this.connections[id] = pool;
      //   return pool;
      // }

      case "sqlite": {
        const db = new SQLiteDriver(id, config);
        this.connections[id] = db;
        return db;
      }

      // case "cassandra": {
      //   const client = new Client({
      //     contactPoints: config.contactPoints.split(","),
      //     localDataCenter: config.localDataCenter,
      //     keyspace: config.keyspace,
      //   });
      //   await client.connect();
      //   this.connections[id] = client;
      //   return client;
      // }
      default:
        throw new Error("Unsupported driver");
    }
  }

  async closeConnection(id: string) {
    const connection = this.connections[id];
    if (!connection) return;

    await connection.disconnect();
    delete this.connections[id];
  }
}

export const connectionManager = new ConnectionManager();
