import Router from "../router";

export default function Layout() {
  return (
    <>
      <h1>@dunstack/router</h1>
      <Router.Outlet />
    </>
  )
}