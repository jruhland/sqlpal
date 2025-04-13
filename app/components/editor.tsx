import {
  MySQL,
  PostgreSQL,
  type SQLNamespace,
  StandardSQL,
  sql,
} from "@codemirror/lang-sql";
import { type EditorView, keymap } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";
import { ClientOnly } from "remix-utils/client-only";
import type { connections } from "~/db/schema.server";
import type { SchemaQueryResults } from "~/lib/drivers/utils";

type EditorProps = {
  connection: Pick<typeof connections.$inferSelect, "id" | "driver">;
  onSubmit: ({
    connectionId,
    statement,
  }: { connectionId: string; statement: string }) => void;
  schemas: SchemaQueryResults | undefined;
};

const mapColumnsToCompletions = (
  columns: { name: string; dataType: string }[],
) =>
  columns.map((column) => ({
    label: column.name,
    type: "property",
    detail: column.dataType,
    info: `Column of type ${column.dataType}`,
    apply: column.name,
  }));

export function Editor({ connection, onSubmit, schemas }: EditorProps) {
  const keyMapping = useMemo(
    () => [
      {
        key: "Shift-Mod-Enter",
        run: ({ state, ...rest }: EditorView) => {
          const statement = state.doc.toString();
          localStorage.setItem("editorValue", statement);
          onSubmit({
            connectionId: connection.id,
            statement,
          });
          return true;
        },
      },
    ],
    [onSubmit, connection.id],
  );

  const schema: SQLNamespace | undefined = useMemo(() => {
    if (!schemas) {
      return undefined;
    }

    if ("schemas" in schemas) {
      return Object.fromEntries(
        schemas.schemas.map((schema) => [
          schema.name,
          Object.fromEntries(
            schema.tables.map((table) => [
              table.name,
              mapColumnsToCompletions(table.columns),
            ]),
          ),
        ]),
      );
    }

    return Object.fromEntries(
      schemas.tables.map((table) => [
        table.name,
        mapColumnsToCompletions(table.columns),
      ]),
    );
  }, [schemas]);

  return (
    <ClientOnly>
      {() => (
        <CodeMirror
          value={localStorage.getItem("editorValue") ?? "-- INSERT SQL HERE"}
          extensions={[
            keymap.of(keyMapping),
            sql({
              schema,
              dialect:
                connection.driver === "postgres"
                  ? PostgreSQL
                  : connection.driver === "mysql"
                    ? MySQL
                    : StandardSQL,
            }),
          ]}
        />
      )}
    </ClientOnly>
  );
}
