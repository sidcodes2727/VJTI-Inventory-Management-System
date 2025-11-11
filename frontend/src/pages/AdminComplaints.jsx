import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import Table from '../components/Table.jsx'
import Modal from '../components/Modal.jsx'
import api from '../utils/api.js'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [labs, setLabs] = useState([])
  const [filters, setFilters] = useState({ labId: '', status: '', severity: '' })
  const [loading, setLoading] = useState(false)
  const [sel, setSel] = useState(null)
  const [status, setStatus] = useState('open')
  const [comment, setComment] = useState('')
  const [viewSel, setViewSel] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.labId) params.labId = filters.labId
      if (filters.status) params.status = filters.status
      const { data } = await api.get('/complaints', { params })
      setComplaints(data)
    } finally { setLoading(false) }
  }

  const loadLabs = async () => {
    const { data } = await api.get('/labs')
    setLabs(data)
  }

  useEffect(() => { loadLabs() }, [])
  useEffect(() => { load() }, [filters.labId, filters.status])

  const openStatus = (c) => { setSel(c); setStatus(c.status); setComment(c.adminComment || ''); }
  const saveStatus = async () => {
    if (!sel) return
    await api.patch(`/complaints/${sel._id}/status`, { status, adminComment: comment })
    setSel(null); setComment('')
    load()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Complaints</h2>
        <div className="flex items-center gap-2">
          <select className="border rounded px-3 py-2 bg-white" value={filters.labId} onChange={e=>setFilters(f=>({...f, labId: e.target.value}))}>
            <option value="">All Labs</option>
            {labs.map(l=> <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <select className="border rounded px-3 py-2 bg-white" value={filters.status} onChange={e=>setFilters(f=>({...f, status: e.target.value}))}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-black/5">
        {loading ? (
          <div className="h-40 grid place-items-center text-gray-500 text-sm">Loading...</div>
        ) : (
          <Table
            columns={[
              { key: 'createdAt', title: 'Date', render: (v)=> new Date(v).toLocaleString() },
              { key: 'lab', title: 'Lab', render: (_, r)=> r.labId?.name || '-' },
              { key: 'title', title: 'Title' },
              { key: 'description', title: 'Description', render: (v)=> (v && v.length > 60 ? v.slice(0,60)+"…" : (v||'-')) },
              { key: 'item', title: 'Item', render: (_, r)=> r.itemId ? `${r.itemId.name} (${r.itemId.category})` : '-' },
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
              { key: 'actions', title: 'Actions', render: (_, r) => (
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded border text-sm" onClick={()=>setViewSel(r)}>View</button>
                  <button className="px-2 py-1 rounded border text-sm" onClick={()=>openStatus(r)}>Change Status</button>
                </div>
              )}
            ]}
            data={complaints}
          />
        )}
      </div>

      <Modal open={!!sel} onClose={()=>setSel(null)} title={`Update Status: ${sel?.title}`} footer={
        <>
          <button onClick={()=>setSel(null)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={saveStatus} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Save</button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full border rounded px-3 py-2 bg-white" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Admin Comment</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} value={comment} onChange={e=>setComment(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal open={!!viewSel} onClose={()=>setViewSel(null)} title={viewSel ? `Complaint: ${viewSel.title}` : 'Complaint'} footer={
        <>
          <button onClick={()=>setViewSel(null)} className="px-3 py-1.5 rounded border">Close</button>
        </>
      }>
        {viewSel && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Lab: {viewSel.labId?.name || '-'}</div>
            <div className="text-sm text-gray-600">Item: {viewSel.itemId ? `${viewSel.itemId.name} (${viewSel.itemId.category})` : '-'}</div>
            <div>
              <div className="font-medium mb-1">Description</div>
              <p className="whitespace-pre-wrap text-gray-800 text-sm">{viewSel.description || '-'}</p>
            </div>
            <div>
              <div className="font-medium mb-1">Photos</div>
              <div className="grid grid-cols-3 gap-2">
                {(viewSel.attachments||[]).map((a, idx) => (
                  <a key={idx} href={`${API_BASE}${a.url}`} target="_blank" rel="noreferrer">
                    <img src={`${API_BASE}${a.url}`} alt={`attachment-${idx}`} className="w-full h-28 object-cover rounded border" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
