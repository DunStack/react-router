import React from "react";
import { RouterProvider, Outlet, Route, Routes, Link, useRouter } from '../lib'

export default function App() {
  return (
    <RouterProvider history={history}>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<Page name="Home" />} />
          <Route path="posts" element={<Page name="Posts Layout" />}>
            <Route element={<Posts />} />
            <Route path=":postId" element={<Post />} />
          </Route>
          <Route path="dashboard" element={<Page name="Dashboard" />} />
        </Route>
        <Route path="about" element={<Page name="About" />} />
        <Route path="*" element={<Page name="Not found" />} />
      </Routes>
    </RouterProvider>
  )
}

function Layout() {
  return (
    <div>
      <header>
        <h1>@dunstack/router</h1>
        <nav>
          <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/posts'>Posts</Link></li>
            <li><Link to='/dashboard'>Dashboard</Link></li>
            <li><Link to='/about'>About</Link></li>
            <li><Link to='/any'>404</Link></li>
          </ul>
        </nav>
      </header>
      <hr />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function Posts() {
  return (
    <div>
      <h2>
        All posts
      </h2>
      <ul>
        <li><Link to='/posts/:postId' params={{ postId: 1 }}>Post 1</Link></li>
        <li><Link to='/posts/:postId' params={{ postId: 2 }}>Post 2</Link></li>
      </ul>
    </div>
  )
}

function Post() {
  const router = useRouter()
  
  return (
    <div>
      <button onClick={router.back}>Go back</button>
      <h2>
        Post 1
      </h2>
    </div>
  )
}

function Page({ name = "" }) {
  return (
    <div>
      <p>{name}</p>
      <Outlet />
    </div>
  )
}