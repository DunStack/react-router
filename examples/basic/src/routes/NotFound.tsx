import { Link } from '@dunstack/router'

export default function NotFound() {
  return (
    <div>
      <h1 className='text-4xl font-bold'>404 Page Not Found.</h1>
      <Link to='/'>Back to home page</Link>
    </div>
  )
}