import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import api from '../utils/api.js'
import Table from '../components/Table.jsx'
import { toast } from 'sonner'

export default function LabList() {
  const [labs, setLabs] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const load = async () => {
    const { data } = await api.get('/labs')
    setLabs(data)
  }

  useEffect(() => { load() }, [])

  const addLab = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await api.post('/labs', { name, description })
      toast.success('Lab created')
      setName('')
      setDescription('')
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create lab')
    }
  }

  const removeLab = async (id) => {
    if (!confirm('Delete this lab?')) return
    try {
      await api.delete(`/labs/${id}`)
      toast.success('Lab deleted')
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete lab')
    }
  }

  return (
    <Layout>
      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-3">
          <h2 className="text-xl font-semibold">Labs</h2>
          <Table
            columns={[
              { key: 'name', title: 'Name' },
              { key: 'description', title: 'Description' },
              { key: 'actions', title: 'Actions', render: (_, row) => (
                <button onClick={() => removeLab(row._id)} className="text-red-600 hover:underline">Delete</button>
              ) }
            ]}
            data={labs}
          />
        </div>
        <form onSubmit={addLab} className="w-80 bg-white border rounded p-4 space-y-2">
          <h3 className="font-semibold">Add Lab</h3>
          <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <button className="w-full bg-vjtiBlue text-white rounded py-2">Create</button>
        </form>
      </div>
    </Layout>
  )
}
