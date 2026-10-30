import type { ReactNode } from "react";

export type Column<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
};

/** A table of `rows`, one column per entry of `columns`, with `empty` shown when there are no rows. */
export function DataTable<Row extends { id: string }>({
  columns,
  rows,
  empty,
  label,
}: {
  columns: Column<Row>[];
  rows: Row[];
  empty: string;
  label: string;
}) {
  if (rows.length === 0) {
    return <p className="cd-empty">{empty}</p>;
  }
  return (
    <table className="cd-table" aria-label={label}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
