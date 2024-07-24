import { Outlet, useRouter } from '@dunstack/router'
import { useContext, useEffect, useState } from 'react'
import UserContext from '../contexts/UserContext'

export default function ProtectedLayout() {
  const router = useRouter()
  const [user] = useContext(UserContext)
  const [countdown, setCountdown] = useState(user ? 0 : 5)

  useEffect(() => {
    if (user) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } 
    
    router.replace('/login', { 
      state: { 
        from: router.location 
      } 
    })
  }, [countdown, router, user])
  
  if (user) return <Outlet />
  
  return (
    <p>This route is private. You will be redirected to login page in {countdown}</p>
  )
}