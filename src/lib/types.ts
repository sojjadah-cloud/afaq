// Minimal stand-in for mysql2's RowDataPacket, kept so query<T>() call sites
// don't need touching after the switch to better-sqlite3.
export interface RowDataPacket {
    [column: string]: any
}
