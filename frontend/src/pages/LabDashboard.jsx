import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import Table from '../components/Table.jsx'
import Modal from '../components/Modal.jsx'
import api from '../utils/api.js'
import { toast } from 'sonner'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function LabDashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [reqOpen, setReqOpen] = useState(false)
  const [reqItem, setReqItem] = useState(null)
  const [qty, setQty] = useState(1)
  const [myRequests, setMyRequests] = useState([])
  const [complaints, setComplaints] = useState([])
  const [compOpen, setCompOpen] = useState(false)
  const [cTitle, setCTitle] = useState('')
  const [cDesc, setCDesc] = useState('')
  const [cSeverity, setCSeverity] = useState('low')
  const [cItemId, setCItemId] = useState('')
  const [cFiles, setCFiles] = useState([])

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

  const loadComplaints = async () => {
    const { data } = await api.get('/complaints/mine')
    setComplaints(data)
  }

  useEffect(() => { loadItems(); loadMyRequests(); loadComplaints() }, [])

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
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">My Inventory</h2>
            <button onClick={async ()=>{
              try {
                const { data } = await api.get('/items/export', { params: { format: 'csv' }, responseType: 'blob' })
                const url = window.URL.createObjectURL(new Blob([data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'my-items.csv')
                document.body.appendChild(link)
                link.click()
                link.remove()
              } catch (e) { toast.error(e?.response?.data?.message || 'Export failed') }
            }} className="px-2 py-1 rounded border text-sm">Export CSV</button>
          </div>
          {loading ? (
            <div className="h-40 grid place-items-center text-gray-500 text-sm">Loading...</div>
          ) : (
            <Table
              columns={[
                { key: 'name', title: 'Item' },
                { key: 'category', title: 'Category' },
                { key: 'totalCount', title: 'Total' },
                { key: 'workingCount', title: 'Working' },
                { key: 'damagedCount', title: 'Damaged' },
                { key: 'lostCount', title: 'Lost' },
                { key: 'actions', title: 'Actions', render: (_, r) => (
                  <button onClick={()=>openRequest(r)} className="px-2 py-1 rounded bg-vjtiBlue/10 text-vjtiBlue hover:bg-vjtiBlue/15">Request Stock</button>
                ) }
              ]}
              data={items}
            />
          )}
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">My Requests</h2>
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

      <div className="mt-6 bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Complaints</h2>
          <button onClick={()=>{ setCTitle(''); setCDesc(''); setCSeverity('low'); setCItemId(''); setCompOpen(true) }} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">New Complaint</button>
        </div>
        <Table
          columns={[
            { key: 'createdAt', title: 'Date', render: (v)=> new Date(v).toLocaleDateString() },
            { key: 'title', title: 'Title' },
            { key: 'item', title: 'Item', render: (_, r) => r.itemId ? `${r.itemId.name} (${r.itemId.category})` : '-' },
            { key: 'attachments', title: 'Photos', render: (_, r) => (
              <div className="flex gap-1">
                {(r.attachments||[]).slice(0,3).map((a, idx) => (
                  <a key={idx} href={`${API_BASE}${a.url}`} target="_blank" rel="noreferrer">
                    <img src={`${API_BASE}${a.url}`} alt="att" className="h-8 w-8 object-cover rounded border" />
                  </a>
                ))}
              </div>
            ) },
            { key: 'severity', title: 'Severity', render: (v)=> (
              <span className={`px-2 py-0.5 rounded text-xs ${v==='high'?'bg-red-100 text-red-700':v==='medium'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{v}</span>
            ) },
            { key: 'status', title: 'Status', render: (v)=> (
              <span className={`px-2 py-0.5 rounded text-xs ${v==='resolved'?'bg-green-100 text-green-700':v==='in_progress'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-700'}`}>{v.replace('_',' ')}</span>
            ) },
          ]}
          data={complaints}
        />
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

      <Modal open={compOpen} onClose={()=>setCompOpen(false)} title="New Complaint" footer={
        <>
          <button onClick={()=>setCompOpen(false)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={async ()=>{
            if (!cTitle.trim()) return toast.error('Title is required')
            try {
              const { data: created } = await api.post('/complaints', { title: cTitle.trim(), description: cDesc, severity: cSeverity, itemId: cItemId || undefined })
              if (cFiles && cFiles.length) {
                const form = new FormData()
                for (const f of cFiles) form.append('files', f)
                await api.post(`/complaints/${created._id}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
              }
              toast.success('Complaint submitted')
              setCompOpen(false)
              setCFiles([])
              loadComplaints()
            } catch (e) {
              toast.error(e?.response?.data?.message || 'Failed to submit complaint')
            }
          }} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Submit</button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" value={cTitle} onChange={e=>setCTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} value={cDesc} onChange={e=>setCDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Severity</label>
              <select className="w-full border rounded px-3 py-2 bg-white" value={cSeverity} onChange={e=>setCSeverity(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Related Item (optional)</label>
              <select className="w-full border rounded px-3 py-2 bg-white" value={cItemId} onChange={e=>setCItemId(e.target.value)}>
                <option value="">-- None --</option>
                {items.map(it => (
                  <option key={it._id} value={it._id}>{it.name} ({it.category})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Photos (up to 5 images)</label>
            <input type="file" accept="image/*" multiple onChange={e=>setCFiles(Array.from(e.target.files||[]))} />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
