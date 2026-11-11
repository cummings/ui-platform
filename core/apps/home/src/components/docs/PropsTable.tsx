export interface PropRow {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}

export function PropsTable({ rows, title = "Props" }: { rows: PropRow[]; title?: string }) {
  return (
    <div className="my-5 overflow-x-auto rounded-card border border-border bg-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">{title}</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">
            <th scope="col" className="px-4 py-2 font-medium">Name</th>
            <th scope="col" className="px-4 py-2 font-medium">Type</th>
            <th scope="col" className="px-4 py-2 font-medium">Default</th>
            <th scope="col" className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border align-top last:border-0">
              <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-fg">
                {r.name}
                {r.required && <span className="text-danger" title="required">*</span>}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-brand">{r.type}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{r.default ?? "—"}</td>
              <td className="px-4 py-2.5 text-fg-muted">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
