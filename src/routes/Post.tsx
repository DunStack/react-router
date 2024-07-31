import { useParams } from "../../lib/router"

export default function Post() {
  const { id } = useParams()!

  return <p>Post {id}</p>
}