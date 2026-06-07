import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}