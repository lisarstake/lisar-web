import React from 'react'
import { Button } from '@lisar/ui'

export const App: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: 'white' }}>Lisar Admin</h1>
      <p style={{ color: '#9ca3af' }}>Admin dashboard scaffold</p>
      <div style={{ marginTop: 16 }}>
        <Button variant="primary">Primary Button</Button>
      </div>
    </div>
  )
}
