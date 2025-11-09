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
  const totalsByLab = items.reduce((acc, it) => {
    const key = it.labId
    acc[key] = (acc[key] || 0) + (it.totalCount || 0)
    return acc
  }, {})
  const barData = Object.entries(totalsByLab).map(([labId, total]) => ({
    name: labNameById[labId] || 'Unknown Lab',
    total
  }))

  const pieData = [
    { name: 'Working', value: totals.working },
    { name: 'Damaged', value: totals.damaged },
    { name: 'Lost', value: totals.lost },
  ]
  const COLORS = ['#22c55e', '#ef4444', '#9ca3af']

  return (
    <Layout>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded border p-4">
          <div className="text-sm text-gray-600">Total Inventory</div>
          <div className="text-2xl font-semibold">{totals.total}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-sm text-gray-600">Working</div>
          <div className="text-2xl font-semibold text-green-600">{totals.working}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-sm text-gray-600">Damaged + Lost</div>
          <div className="text-2xl font-semibold text-red-600">{totals.damaged + totals.lost}</div>
        </div>
      </div>

      <div className="bg-white rounded border p-4 mb-6">
        <h3 className="font-semibold mb-2">Inventory by Lab</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total Items" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded border p-4">
        <h3 className="font-semibold mb-2">Working vs Damaged vs Lost</h3>
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
