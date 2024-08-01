import { useHistory } from "../../lib/router"

export default function NoMatch() {
  const history = useHistory()
  
  return (
    <>
      <p>404! Page Not Found.</p>
      <button onClick={() => history.push('/')}>Go to home</button>
    </>
  )
}