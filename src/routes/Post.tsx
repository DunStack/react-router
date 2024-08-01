import { Link, useParams } from "../../lib/router"

export default function Post() {
  const { id } = useParams()!

  return (
    <>
      <Link to={-1}>Go back</Link>
      <p>Post {id}</p>
    </>
  )
}