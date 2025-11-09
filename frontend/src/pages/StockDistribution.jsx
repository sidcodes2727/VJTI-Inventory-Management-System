import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import { toast } from 'sonner'

export default function StockDistribution() {
  const [labs, setLabs] = useState([])
  const [items, setItems] = useState([])
  const [fromItemId, setFromItemId] = useState('')
  const [fromLabId, setFromLabId] = useState('')
  const [toLabId, setToLabId] = useState('')
  const [qty, setQty] = useState(1)

  const load = async () => {
    const [labsRes, itemsRes] = await Promise.all([
      api.get('/labs'),
      api.get('/items')
    ])
    setLabs(labsRes.data)
    setItems(itemsRes.data)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    // when selecting item, ensure fromLabId is that item's lab
    const it = items.find(i => i._id === fromItemId)
    if (it) setFromLabId(it.labId?._id || it.labId)
  }, [fromItemId, items])

  const submit = async (e) => {
    e.preventDefault()
    if (!fromItemId || !fromLabId || !toLabId) return toast.error('Please select all fields')
    if (fromLabId === toLabId) return toast.error('Labs must be different')
    try {
      await api.post('/items/transfer', { itemId: fromItemId, fromLabId, toLabId, qty: Number(qty) })
      toast.success('Transfer complete')
      setQty(1)
      setToLabId('')
      setFromItemId('')
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Transfer failed')
    }
  }

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Stock Distribution</h2>
      <form onSubmit={submit} className="bg-white border rounded p-4 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm mb-1">Select Source Item</label>
          <select className="w-full border rounded px-3 py-2 bg-white" value={fromItemId} onChange={e=>setFromItemId(e.target.value)}>
            <option value="">-- Select Item (from lab) --</option>
            {items.map(it => (
              <option key={it._id} value={it._id}>{it.name} ({it.category}) - {it.labId?.name} - Working: {it.workingCount}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">From Lab</label>
            <input className="w-full border rounded px-3 py-2 bg-gray-50" value={labs.find(l=>l._id===fromLabId)?.name || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm mb-1">To Lab</label>
            <select className="w-full border rounded px-3 py-2 bg-white" value={toLabId} onChange={e=>setToLabId(e.target.value)}>
              <option value="">-- Select Lab --</option>
              {labs.filter(l=>l._id!==fromLabId).map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Quantity</label>
            <input type="number" min={1} className="w-full border rounded px-3 py-2" value={qty} onChange={e=>setQty(e.target.value)} />
          </div>
        </div>
        <div className="pt-2">
          <button className="px-4 py-2 bg-vjtiBlue text-white rounded">Transfer</button>
        </div>
      </form>
    </Layout>
  )
}
