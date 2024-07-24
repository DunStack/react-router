import { Route, RouterProvider, Routes } from '@dunstack/router'
import Layout from './routes/Layout'
import Home from './routes/Home'
import Dashboard from './routes/Dashboard'
import ProtectedLayout from './routes/ProtectedLayout'
import NotFound from './routes/NotFound'
import PostList from './routes/PostList'
import PostDetail from './routes/PostDetail'
import Login from './routes/Login'
import UserContext from './contexts/UserContext'
import { useState } from 'react'

function App() {
  const userState = useState<string>()
  
  return (
    <UserContext.Provider value={userState}>
      <RouterProvider history={history}>
        <Routes>
          <Route Component={Layout}>
            <Route Component={Home} />
            <Route path='login' Component={Login} />
            <Route Component={ProtectedLayout}>        
              <Route path='dashboard' Component={Dashboard} />
              <Route path='posts'>
                <Route Component={PostList} />
                <Route path=':postId' Component={PostDetail} />
              </Route>
            </Route>
          </Route>
          <Route path='*' Component={NotFound} />
        </Routes>
      </RouterProvider>
    </UserContext.Provider>
  )
}

export default App
