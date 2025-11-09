import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import Table from '../components/Table.jsx'
import { toast } from 'sonner'

export default function RequestManagement() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/requests')
      setRequests(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const act = async (id, action) => {
    try {
      await api.post(`/requests/${id}/${action}`)
      toast.success(`Request ${action}d`)
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action failed')
    }
  }

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Stock Requests</h2>
      {loading ? 'Loading...' : (
        <Table
          columns={[
            { key: 'lab', title: 'Lab', render: (_, r) => r.labId?.name },
            { key: 'item', title: 'Item', render: (_, r) => `${r.itemId?.name} (${r.itemId?.category})` },
            { key: 'requestedQty', title: 'Qty' },
            { key: 'status', title: 'Status', render: (v) => (
              <span className={`px-2 py-0.5 rounded text-xs ${v==='approved'?'bg-green-100 text-green-700':v==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{v}</span>
            ) },
            { key: 'actions', title: 'Actions', render: (_, r) => (
              r.status === 'pending' ? (
                <div className="flex gap-2">
                  <button onClick={()=>act(r._id, 'approve')} className="px-2 py-1 text-xs rounded bg-green-600 text-white">Approve</button>
                  <button onClick={()=>act(r._id, 'reject')} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Reject</button>
                </div>
              ) : null
            ) }
          ]}
          data={requests}
        />
      )}
    </Layout>
  )
}
