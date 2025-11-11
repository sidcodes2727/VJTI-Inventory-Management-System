export default function Table({ columns, data }) {
  return (
    <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="text-left sticky top-0 bg-white z-10 border-b">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold text-gray-700">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 border-b align-top">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
