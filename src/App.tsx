import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  )
}


