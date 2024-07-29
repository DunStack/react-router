import Router from "../router"

export default function Post() {
  const { id } = Router.useParams()!

  return <p>Post {id}</p>
}