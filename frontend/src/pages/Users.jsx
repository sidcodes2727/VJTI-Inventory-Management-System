import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import Table from '../components/Table.jsx'
import Modal from '../components/Modal.jsx'
import api from '../utils/api.js'
import { toast } from 'sonner'

export default function Users() {
  const [users, setUsers] = useState([])
  const [labs, setLabs] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'lab', labId: '' })
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [newPwd, setNewPwd] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [u, l] = await Promise.all([
        api.get('/auth/users'),
        api.get('/labs')
      ])
      setUsers(u.data)
      setLabs(l.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role }
      if (form.role === 'lab') payload.labId = form.labId
      await api.post('/auth/signup', payload)
      toast.success('User created')
      setOpen(false)
      setForm({ name: '', email: '', password: '', role: 'lab', labId: '' })
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create user')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <button onClick={()=>setOpen(true)} className="px-3 py-2 bg-vjtiBlue text-white rounded">Create User</button>
      </div>
      {loading ? 'Loading...' : (
        <Table
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
            { key: 'role', title: 'Role' },
            { key: 'lab', title: 'Lab', render: (_, r) => r.labId?.name || '-' },
            { key: 'actions', title: 'Actions', render: (_, r) => (
              <div className="flex gap-2">
                <button className="text-vjtiBlue hover:underline" onClick={() => { setEditUser(r); setEditOpen(true) }}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => { setEditUser(r); setPwdOpen(true) }}>Reset Password</button>
              </div>
            ) },
          ]}
          data={users}
        />
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title="Create User" footer={
        <>
          <button onClick={()=>setOpen(false)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={submit} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Create</button>
        </>
      }>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={e=>setForm(f=>({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={e=>setForm(f=>({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select className="w-full border rounded px-3 py-2 bg-white" value={form.role} onChange={e=>setForm(f=>({ ...f, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="lab">Lab Incharge</option>
            </select>
          </div>
          {form.role === 'lab' && (
            <div>
              <label className="block text-sm mb-1">Lab</label>
              <select className="w-full border rounded px-3 py-2 bg-white" value={form.labId} onChange={e=>setForm(f=>({ ...f, labId: e.target.value }))}>
                <option value="">-- Select Lab --</option>
                {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          )}
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit User: ${editUser?.name || ''}`} footer={
        <>
          <button onClick={() => setEditOpen(false)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={async () => {
            try {
              const payload = { name: editUser.name, email: editUser.email, role: editUser.role }
              if (editUser.role === 'lab') payload.labId = editUser.labId?._id || editUser.labId
              await api.put(`/auth/users/${editUser._id}`, payload)
              toast.success('User updated')
              setEditOpen(false)
              load()
            } catch (e) {
              toast.error(e?.response?.data?.message || 'Failed to update user')
            }
          }} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Save</button>
        </>
      }>
        {editUser && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input className="w-full border rounded px-3 py-2" value={editUser.name} onChange={e=>setEditUser(u=>({ ...u, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2" value={editUser.email} onChange={e=>setEditUser(u=>({ ...u, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Role</label>
              <select className="w-full border rounded px-3 py-2 bg-white" value={editUser.role} onChange={e=>setEditUser(u=>({ ...u, role: e.target.value }))}>
                <option value="admin">Admin</option>
                <option value="lab">Lab Incharge</option>
              </select>
            </div>
            {editUser.role === 'lab' && (
              <div>
                <label className="block text-sm mb-1">Lab</label>
                <select className="w-full border rounded px-3 py-2 bg-white" value={editUser.labId?._id || editUser.labId || ''} onChange={e=>setEditUser(u=>({ ...u, labId: e.target.value }))}>
                  <option value="">-- Select Lab --</option>
                  {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title={`Reset Password: ${editUser?.name || ''}`} footer={
        <>
          <button onClick={() => setPwdOpen(false)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={async () => {
            try {
              await api.post(`/auth/users/${editUser._id}/reset-password`, { password: newPwd })
              toast.success('Password reset')
              setPwdOpen(false)
              setNewPwd('')
            } catch (e) {
              toast.error(e?.response?.data?.message || 'Failed to reset password')
            }
          }} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Reset</button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={newPwd} onChange={e=>setNewPwd(e.target.value)} />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
