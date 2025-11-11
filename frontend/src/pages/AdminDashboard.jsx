import Layout from '../components/Layout.jsx'
import { useEffect, useState } from 'react'
import api from '../utils/api.js'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AdminDashboard() {
  const [items, setItems] = useState([])
  const [labs, setLabs] = useState([])

  useEffect(() => {
    const load = async () => {
      const [{ data: itemsData }, { data: labsData }] = await Promise.all([
        api.get('/items'),
        api.get('/labs')
      ])
      setItems(itemsData)
      setLabs(labsData)
    }
    load()
  }, [])

  const totals = items.reduce((acc, it) => {
    acc.total += it.totalCount
    acc.working += it.workingCount
    acc.damaged += it.damagedCount
    acc.lost += it.lostCount
    return acc
  }, { total: 0, working: 0, damaged: 0, lost: 0 })

  const labNameById = labs.reduce((map, l) => { map[l._id] = l.name; return map }, {})
  // Handle cases where labId is populated as an object ({ _id, name })
  const nameByIdFromItems = {}
  const totalsByLab = items.reduce((acc, it) => {
    const id = typeof it.labId === 'object' && it.labId !== null ? it.labId._id : it.labId
    if (typeof it.labId === 'object' && it.labId?.name) nameByIdFromItems[id] = it.labId.name
    acc[id] = (acc[id] || 0) + (it.totalCount || 0)
    return acc
  }, {})
  const barData = Object.entries(totalsByLab).map(([labId, total]) => ({
    name: nameByIdFromItems[labId] || labNameById[labId] || 'Unknown Lab',
    total
  }))
  const barDataSorted = [...barData].sort((a, b) => b.total - a.total)
  const barHeight = Math.max(240, Math.min(700, 36 * barDataSorted.length + 60))
  const LAB_COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f472b6','#fb7185','#14b8a6','#a3e635','#eab308']

  const pieData = [
    { name: 'Working', value: totals.working },
    { name: 'Damaged', value: totals.damaged },
    { name: 'Lost', value: totals.lost },
  ]
  const COLORS = ['#22c55e', '#ef4444', '#9ca3af']

  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Inventory</div>
              <div className="text-3xl font-semibold tracking-tight">{totals.total}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-vjtiBlue/10 text-vjtiBlue grid place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M3 3h18v4H3z"/><path d="M7 7v14"/><path d="M17 7v14"/><path d="M3 11h18"/></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Working</div>
              <div className="text-3xl font-semibold text-green-600 tracking-tight">{totals.working}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 grid place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Damaged + Lost</div>
              <div className="text-3xl font-semibold text-red-600 tracking-tight">{totals.damaged + totals.lost}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 grid place-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5 mb-6">
        <h3 className="font-semibold mb-3 text-gray-900">Inventory by Lab</h3>
        {barDataSorted.length === 0 ? (
          <div className="h-40 grid place-items-center text-gray-500 text-sm">No data to display</div>
        ) : (
          <div style={{ height: barHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDataSorted} layout="vertical" margin={{ top: 8, right: 24, left: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={160} />
                <Tooltip />
                <Bar dataKey="total" name="Total Items" radius={[4,4,4,4]}>
                  {barDataSorted.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LAB_COLORS[index % LAB_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="font-semibold mb-3 text-gray-900">Working vs Damaged vs Lost</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  )
}
