import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import Table from '../components/Table.jsx'
import Modal from '../components/Modal.jsx'
import api from '../utils/api.js'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.jsx'

export default function InventoryOverview() {
  const { user } = useAuth()
  const [labs, setLabs] = useState([])
  const [selectedLab, setSelectedLab] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const canEdit = useMemo(() => user?.role === 'admin' || user?.role === 'lab', [user])

  const loadLabs = async () => {
    if (user.role === 'admin') {
      const { data } = await api.get('/labs')
      setLabs(data)
    }
  }

  const loadItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (user.role === 'admin' && selectedLab) params.labId = selectedLab
      const { data } = await api.get('/items', { params })
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLabs()
  }, [])

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLab])

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [working, setWorking] = useState(0)
  const [damaged, setDamaged] = useState(0)
  const [lost, setLost] = useState(0)

  const openEdit = (it) => {
    setEditItem(it)
    setWorking(it.workingCount)
    setDamaged(it.damagedCount)
    setLost(it.lostCount)
    setModalOpen(true)
  }

  const saveStatus = async () => {
    if (!editItem) return
    const sum = Number(working) + Number(damaged) + Number(lost)
    if (sum !== editItem.totalCount) {
      toast.error('Sum must equal totalCount')
      return
    }
    try {
      await api.patch(`/items/${editItem._id}/status`, { workingCount: Number(working), damagedCount: Number(damaged), lostCount: Number(lost) })
      toast.success('Updated')
      setModalOpen(false)
      setEditItem(null)
      loadItems()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Inventory Overview</h2>
        {user.role === 'admin' && (
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-vjtiGold focus:ring-2 focus:ring-vjtiGold/60 w-full sm:w-auto"
            value={selectedLab}
            onChange={(e)=>setSelectedLab(e.target.value)}
          >
            <option value="">All Labs</option>
            {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
        {loading ? (
          <div className="h-40 grid place-items-center text-gray-500 text-sm">Loading...</div>
        ) : (
          <Table
            columns={[
              { key: 'name', title: 'Item' },
              { key: 'category', title: 'Category' },
              { key: 'lab', title: 'Lab', render: (_, r) => r.labId?.name || '-' },
              { key: 'totalCount', title: 'Total' },
              { key: 'workingCount', title: 'Working' },
              { key: 'damagedCount', title: 'Damaged' },
              { key: 'lostCount', title: 'Lost' },
              { key: 'actions', title: 'Actions', render: (_, r) => (
                canEdit ? <button className="px-2 py-1 rounded bg-vjtiBlue/10 text-vjtiBlue hover:bg-vjtiBlue/15" onClick={()=>openEdit(r)}>Update Status</button> : null
              )}
            ]}
            data={items}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={`Update Status: ${editItem?.name}`} footer={
        <>
          <button onClick={()=>setModalOpen(false)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={saveStatus} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Save</button>
        </>
      }>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">Total Count: {editItem?.totalCount}</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">Working</label>
              <input type="number" min={0} className="w-full border rounded px-3 py-2" value={working} onChange={e=>setWorking(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Damaged</label>
              <input type="number" min={0} className="w-full border rounded px-3 py-2" value={damaged} onChange={e=>setDamaged(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Lost</label>
              <input type="number" min={0} className="w-full border rounded px-3 py-2" value={lost} onChange={e=>setLost(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
