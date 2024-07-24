import { Link, useParams } from "@dunstack/router"

export default function PostDetail() {
  const params = useParams()

  return (
    <div>
      <Link to={-1}>Go back</Link>
      <h1 className="text-4xl font-bold">Post {params?.postId}</h1>
    </div>
  )
}