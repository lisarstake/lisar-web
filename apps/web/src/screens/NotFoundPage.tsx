import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section>
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go home</Link>
    </section>
  )
}


