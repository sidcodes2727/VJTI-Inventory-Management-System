export default function Table({ columns, data }) {
  return (
    <div className="overflow-auto border rounded bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2 font-semibold text-gray-700 border-b">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="even:bg-gray-50/60">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-2 border-b align-top">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
