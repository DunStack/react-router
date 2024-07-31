import { Outlet } from "../../lib/router";

export default function Layout() {
  return (
    <>
      <h1>@dunstack/router</h1>
      <Outlet />
    </>
  )
}