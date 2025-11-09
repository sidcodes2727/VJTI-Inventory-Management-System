import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import Table from '../components/Table.jsx'
import Modal from '../components/Modal.jsx'
import api from '../utils/api.js'
import { toast } from 'sonner'

export default function LabDashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [reqOpen, setReqOpen] = useState(false)
  const [reqItem, setReqItem] = useState(null)
  const [qty, setQty] = useState(1)
  const [myRequests, setMyRequests] = useState([])

  const loadItems = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/items')
      setItems(data)
    } finally { setLoading(false) }
  }

  const loadMyRequests = async () => {
    const { data } = await api.get('/requests/mine')
    setMyRequests(data)
  }

  useEffect(() => { loadItems(); loadMyRequests() }, [])

  const openRequest = (it) => { setReqItem(it); setQty(1); setReqOpen(true) }

  const submitRequest = async () => {
    if (!reqItem) return
    try {
      await api.post('/requests', { itemId: reqItem._id, requestedQty: Number(qty) })
      toast.success('Request sent')
      setReqOpen(false)
      loadMyRequests()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to request')
    }
  }

  return (
    <Layout>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">My Inventory</h2>
          {loading ? 'Loading...' : (
            <Table
              columns={[
                { key: 'name', title: 'Item' },
                { key: 'category', title: 'Category' },
                { key: 'totalCount', title: 'Total' },
                { key: 'workingCount', title: 'Working' },
                { key: 'damagedCount', title: 'Damaged' },
                { key: 'lostCount', title: 'Lost' },
                { key: 'actions', title: 'Actions', render: (_, r) => (
                  <button onClick={()=>openRequest(r)} className="text-vjtiBlue hover:underline">Request Stock</button>
                ) }
              ]}
              data={items}
            />
          )}
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">My Requests</h2>
          <Table
            columns={[
              { key: 'item', title: 'Item', render: (_, r) => `${r.itemId?.name} (${r.itemId?.category})` },
              { key: 'requestedQty', title: 'Qty' },
              { key: 'status', title: 'Status', render: (v) => (
                <span className={`px-2 py-0.5 rounded text-xs ${v==='approved'?'bg-green-100 text-green-700':v==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{v}</span>
              ) },
            ]}
            data={myRequests}
          />
        </div>
      </div>

      <Modal open={reqOpen} onClose={()=>setReqOpen(false)} title={`Request Stock: ${reqItem?.name}`} footer={
        <>
          <button onClick={()=>setReqOpen(false)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={submitRequest} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Send Request</button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Quantity</label>
            <input type="number" min={1} className="w-full border rounded px-3 py-2" value={qty} onChange={e=>setQty(e.target.value)} />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
