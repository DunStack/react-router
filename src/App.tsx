import { RouterProvider, Routes, Route, createBrowserHistory } from "../lib/router";
import Home from "./routes/Home";
import Layout from "./routes/Layout";
import NoMatch from "./routes/NoMatch";
import Post from "./routes/Post";
import Posts from "./routes/Posts";

const history = createBrowserHistory()

export default function App() {
  return (
    <RouterProvider history={history}>
      <Routes>
        <Route Component={Layout}>
          <Route Component={Home} />
          <Route path='posts'>
            <Route Component={Posts} />
            <Route path=':id' Component={Post} />
          </Route>
        </Route>
        <Route path='*' Component={NoMatch} />
      </Routes>
    </RouterProvider>
  )
}
