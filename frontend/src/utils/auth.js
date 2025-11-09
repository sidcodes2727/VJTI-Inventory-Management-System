export const getToken = () => localStorage.getItem('vjti_token')
export const getUser = () => {
  const raw = localStorage.getItem('vjti_user')
  return raw ? JSON.parse(raw) : null
}
