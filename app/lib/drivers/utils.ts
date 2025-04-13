export type Row = {
  table_schema?: string;
  schema_name?: string;
  schema_description?: string;
  table_name: string;
  table_description?: string;
  column_name: string;
  column_description?: string;
  data_type: string;
};

export type Column = {
  name: string;
  dataType: string;
};

export type Table = {
  name: string;
  columns: Column[];
};

export type Schema = {
  name: string;
  tables: Table[];
};

export type SchemaQueryResults =
  | {
      schemas: Schema[];
    }
  | {
      tables: Table[];
    };

export function formatSchemaQueryResults(rows: Row[]): SchemaQueryResults {
  if (rows.length === 0) {
    return { schemas: [] };
  }

  // IDs will be full paths of objects
  // `schemaname`, `schemaname.tablename`
  let hasSchema = false;
  const schemasById: Record<string, Schema> = {};
  const tablesById: Record<string, Table> = {};
  const schemasTablesById: Record<string, Record<string, Table>> = {};

  for (const row of rows) {
    const schemaName = row.schema_name || row.table_schema;
    const tableName = row.table_name;
    const columnName = row.column_name;
    const dataType = row.data_type;

    const schemaId = schemaName;
    const tableId = schemaName ? `${schemaName}.${tableName}` : tableName;

    if (schemaId && !schemasById[schemaId]) {
      hasSchema = true;
      schemasById[schemaId] = {
        name: schemaName,
        tables: [],
      };
      schemasTablesById[schemaId] = {};
    }

    // If schema exists and table is not yet there, add it to schema
    // Its pushed to tables array for final product, and added to tablesById map
    // so final operation can remove tablesById map and not have to iterate the list again
    if (!schemasTablesById[schemaId][tableId]) {
      const table = {
        name: tableName,
        columns: [],
      };
      schemasTablesById[schemaId][tableId] = table;

      if (!tablesById[tableId]) {
        schemasById[schemaId].tables.push(table);
        schemasTablesById[schemaId][tableId] = table;
      }
    }

    const column = {
      name: columnName,
      dataType,
    };

    schemasTablesById[schemaId][tableId].columns.push(column);
  }

  if (hasSchema) {
    return {
      schemas: Object.values(schemasById),
    };
  }

  return {
    tables: Object.values(tablesById),
  };
}
