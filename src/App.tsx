import Router from "./router";
import Home from "./routes/Home";
import Layout from "./routes/Layout";
import NoMatch from "./routes/NoMatch";
import Post from "./routes/Post";
import Posts from "./routes/Posts";

export default function App() {
  return (
    <Router.Provider>
      <Router.Routes>
        <Router.Route Component={Layout}>
          <Router.Route Component={Home} />
          <Router.Route path='posts'>
            <Router.Route Component={Posts} />
            <Router.Route path=':id' Component={Post} />
          </Router.Route>
        </Router.Route>
        <Router.Route path='*' Component={NoMatch} />
      </Router.Routes>
    </Router.Provider>
  )
}
