import { useContext } from "react"
import UserContext from "../contexts/UserContext"
import { useLocation, useRouter, Location } from '@dunstack/router'

export default function Login() {
  const [, setUser] = useContext(UserContext)
  const router = useRouter()
  const { state } = useLocation<{ from: Location }>()
  
  
  return (
    <div>
      <h1 className="text-4xl font-bold">Login</h1>
      <form 
        className="grid grid-cols-1 gap-4 mt-6" 
        onSubmit={e => {
          e.preventDefault()
          setUser(e.currentTarget['username'].value)
          router.replace(state?.from.pathname || '/')
        }}
      >
        <label className="block">
          <span className="text-gray-700">Username</span>
          <input type='text' name='username' placeholder="Type something to login" className="block mt-1 w-full" />
        </label>
        <div>
          <button type="submit" className="bg-gray-900 text-white py-2 px-4">
            Login
          </button>
        </div>
      </form>
    </div>
  )
}