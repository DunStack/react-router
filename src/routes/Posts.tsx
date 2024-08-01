import { Link } from "../../lib/router";

export default function Posts() {
  return (
    <ul>
      <li><Link to="/posts/:id" params={{ id: 1 }}>Post 1</Link></li>
      <li><Link to="/posts/:id" params={{ id: 2 }}>Post 2</Link></li>
    </ul>
  )
}