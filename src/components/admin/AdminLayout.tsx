import React from 'react'
import { Bell, LogOut, Menu, X } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  staffName?: string
  staffRole?: string
  onLogout?: () => void
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  staffName = 'Admin User',
  staffRole = 'ADMIN',
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Members', path: '/admin/members', icon: '👥' },
    { label: 'Accounts', path: '/admin/accounts', icon: '💰' },
    { label: 'Transactions', path: '/admin/transactions', icon: '📝' },
    { label: 'Support', path: '/admin/support', icon: '🎧' },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📋' },
    { label: 'Security', path: '/admin/security', icon: '🔒' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className="flex h-screen bg-evermont-light">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-evermont-blue text-white transition-all duration-300 flex flex-col hidden md:flex`}
      >
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-evermont-gold flex items-center justify-center text-evermont-blue font-bold">
              E
            </div>
            {sidebarOpen && <span className="font-bold">Evermont Ops</span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {adminMenuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-2"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-evermont-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-evermont-blue">Operations</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-evermont-border">
              <div className="text-right">
                <div className="font-medium text-sm text-gray-900">{staffName}</div>
                <div className="text-xs text-gray-500">{staffRole}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-evermont-gold text-evermont-blue flex items-center justify-center font-bold">
                {staffName.charAt(0)}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <aside className="w-64 h-full bg-evermont-blue text-white">
            <nav className="p-4 space-y-2">
              {adminMenuItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}
