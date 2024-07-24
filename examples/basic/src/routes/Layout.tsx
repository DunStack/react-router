import { Link, Outlet } from '@dunstack/router'

export default function Layout() {
  return (
    <div className='flex container max-w-4xl mx-auto py-12 divide-x'>
      <aside className='p-4'>
        <h2>
          <Link to='/'>@dunstack/router</Link>
        </h2>
        <nav>
          <ul className='list-disc list-inside'>
            <li>
              <Link to='/login'>Login</Link>
            </li>
            <li>
              <Link to='/dashboard'>Dashboard</Link>
            </li>
            <li>
              <Link to='/posts'>Posts</Link>
            </li>
            <li>
              <Link to='/no-match'>No match</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className='p-4'>
        <Outlet />
      </main>
    </div>
  )
}