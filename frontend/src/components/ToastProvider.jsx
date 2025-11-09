import { Toaster } from 'sonner'

export default function ToastProvider({ children }) {
  return (
    <>
      <Toaster richColors position="top-right" />
      {children}
    </>
  )
}
