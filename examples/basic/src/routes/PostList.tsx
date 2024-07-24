import { Link } from '@dunstack/router'

export default function PostList() {
  return (
    <div>
      <h1 className='text-4xl font-bold'>Posts</h1>
      <ul className='list-disc list-inside mt-4'>
        <li>
          <Link to='/posts/:id' params={{ id: 1 }}>Post 1</Link>
        </li>
        <li>
          <Link to=':id' params={{ id: 2 }}>Post 2</Link>
        </li>
      </ul>
    </div>
  )
}