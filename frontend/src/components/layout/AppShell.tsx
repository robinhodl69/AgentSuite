import {
  AppstoreOutlined,
  PlusSquareOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Dropdown, Drawer, Grid, Layout, Menu } from 'antd'
import type { ItemType, MenuItemType } from 'antd/es/menu/interface'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { AuthUser } from '../../lib/api/auth'
import { erpModules } from '../../lib/mock-data/erpModules'
import { useAuth } from '../../lib/auth-context'
import { ModuleIcon } from '../ui/ModuleIcon'
import { Button } from '../ui/Button'

interface AppShellProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
}

function moduleNavigationItems(collapsed: boolean): ItemType<MenuItemType>[] {
  return [
    {
      key: 'modules',
      icon: <AppstoreOutlined />,
      label: collapsed ? '' : 'Modules',
      title: 'Modules',
      children: erpModules.map((module) => ({
        key: module.href,
        icon: <ModuleIcon slug={module.slug} className="h-4 w-4" />,
        label: <Link to={module.href}>{collapsed ? '' : module.title}</Link>,
        title: module.title,
      })),
    },
    {
      key: '/erp/create-task',
      icon: <PlusSquareOutlined />,
      label: <Link to="/erp/create-task">{collapsed ? '' : 'Create Task'}</Link>,
      title: 'Create Task',
    },
    {
      key: '/erp/integrations',
      icon: <SettingOutlined />,
      label: <Link to="/erp/integrations">{collapsed ? '' : 'Integrations'}</Link>,
      title: 'Integrations',
    },
  ]
}

function AccountMenuButton({
  collapsed,
  user,
  sessionMenuItems,
}: {
  collapsed: boolean
  user: AuthUser | null
  sessionMenuItems: ItemType<MenuItemType>[]
}) {
  if (!user) {
    return null
  }

  return (
    <Dropdown menu={{ items: sessionMenuItems }} trigger={['click']} placement={collapsed ? 'bottomRight' : 'topRight'}>
      <button
        type="button"
        className={[
          'flex w-full items-center rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] px-3 py-2 text-left transition',
          'hover:border-[var(--as-border-strong)] hover:bg-[var(--as-bg-hover)]',
          collapsed ? 'justify-center' : 'gap-3',
        ].join(' ')}
        aria-label="Open account menu"
      >
        <Avatar
          size="small"
          icon={<UserOutlined />}
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.16)', color: '#93c5fd' }}
        />
        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono">
                Account
              </p>
              <p className="truncate text-xs text-[var(--as-text-primary)]">Open user menu</p>
            </div>
            <DownOutlined className="text-[10px] text-[var(--as-text-muted)]" />
          </>
        ) : null}
      </button>
    </Dropdown>
  )
}

function ShellNavigation({
  collapsed,
  selectedKey,
  onNavigate,
  onToggle,
  user,
  sessionMenuItems,
}: {
  collapsed: boolean
  selectedKey: string
  onNavigate: () => void
  onToggle: () => void
  user: AuthUser | null
  sessionMenuItems: ItemType<MenuItemType>[]
}) {
  const moduleItems = moduleNavigationItems(collapsed)

  return (
    <div className="flex h-full flex-col bg-[var(--as-bg-primary)]">
      <div
        className={[
          'flex h-[var(--as-header-height)] items-center border-b border-[var(--as-border-default)]',
          collapsed ? 'justify-center px-3' : 'justify-between px-4',
        ].join(' ')}
      >
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--as-radius-md)] bg-[var(--as-accent)] text-sm font-bold text-white">
            A
          </div>
          {!collapsed ? (
            <p className="truncate text-sm font-semibold text-[var(--as-text-primary)]">AgentSuite</p>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--as-radius-sm)] text-[var(--as-text-muted)] transition hover:bg-[var(--as-bg-hover)] hover:text-[var(--as-text-primary)]"
            aria-label="Collapse sidebar"
          >
            <MenuFoldOutlined />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={collapsed ? [] : ['modules']}
          inlineCollapsed={collapsed}
          items={moduleItems}
          onClick={onNavigate}
          className="border-0 bg-transparent"
        />
      </div>

      <div className="border-t border-[var(--as-border-default)] px-3 py-3">
        <div className={collapsed ? 'flex justify-center' : ''}>
          <AccountMenuButton collapsed={collapsed} user={user} sessionMenuItems={sessionMenuItems} />
        </div>
        {collapsed ? (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--as-radius-sm)] text-[var(--as-text-muted)] transition hover:bg-[var(--as-bg-hover)] hover:text-[var(--as-text-primary)]"
              aria-label="Expand sidebar"
            >
              <MenuUnfoldOutlined />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const screens = Grid.useBreakpoint()
  const isDesktop = Boolean(screens.md)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/erp/integrations')) {
      return '/erp/integrations'
    }

    if (location.pathname.startsWith('/erp/create-task')) {
      return '/erp/create-task'
    }

    const matchingModule = erpModules.find((module) => location.pathname.startsWith(module.href))
    return matchingModule?.href ?? location.pathname
  }, [location.pathname])

  const sessionMenuItems: ItemType<MenuItemType>[] = [
    {
      key: 'user-summary',
      disabled: true,
      label: user ? (
        <div className="min-w-[220px] py-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono">
            User
          </p>
          <p className="mt-1 text-sm text-[var(--as-text-primary)]">{user.email}</p>
          <p className="text-xs text-[var(--as-text-secondary)]">{user.role.replace(/_/g, ' ')}</p>
        </div>
      ) : null,
    },
    {
      type: 'divider',
    },
    {
      key: 'workspace',
      label: <Link to="/erp">Workspace</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => void logout(),
    },
  ]

  return (
    <Layout className="min-h-screen bg-[var(--as-bg-base)]">
      {isDesktop ? (
        <Layout.Sider
          width={240}
          collapsedWidth={80}
          collapsed={sidebarCollapsed}
          theme="dark"
          className="border-r border-[var(--as-border-default)]"
        >
          <ShellNavigation
            collapsed={sidebarCollapsed}
            selectedKey={selectedKey}
            onNavigate={() => undefined}
            onToggle={() => setSidebarCollapsed((current) => !current)}
            user={user}
            sessionMenuItems={sessionMenuItems}
          />
        </Layout.Sider>
      ) : (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          closable={false}
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <ShellNavigation
            collapsed={false}
            selectedKey={selectedKey}
            onNavigate={() => setMobileOpen(false)}
            onToggle={() => setMobileOpen(false)}
            user={user}
            sessionMenuItems={sessionMenuItems}
          />
        </Drawer>
      )}

      <Layout className="bg-transparent">
        <Layout.Content className="flex-1" style={{ padding: 'calc(var(--as-density-pad-section) + 6px)' }}>
          {!isDesktop ? (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <MenuOutlined />
              </Button>
            </div>
          ) : null}
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
