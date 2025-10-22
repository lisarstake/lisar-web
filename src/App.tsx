import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="app-container">
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}


