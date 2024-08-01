import { Outlet, Link } from "../../lib/router";

export default function Layout() {
  return (
    <>
      <header>
        <h1>@dunstack/router</h1>
        <nav>
          <Link to='/posts'>Posts</Link>
          <Link to='/no-match' style={{ marginLeft: 8 }}>No-match</Link>
        </nav>
      </header>

      <hr />
      
      <main>
        <Outlet />
      </main>
    </>
  )
}