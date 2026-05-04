import { App as AntApp, ConfigProvider, theme, type ThemeConfig } from 'antd'
import type { ReactNode } from 'react'

// Central UI tokens for the ERP console. New visual primitives should align here
// before introducing page-level colors, radii, or spacing exceptions.
const appTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#3b82f6',
    colorSuccess: '#4ade80',
    colorWarning: '#f97316',
    colorError: '#f87171',
    colorInfo: '#3b82f6',
    colorBgBase: '#0a0a0a',
    colorBgContainer: '#111111',
    colorBgElevated: '#141414',
    colorText: '#e5e5e5',
    colorTextSecondary: '#888888',
    colorBorder: '#222222',
    colorSplit: '#222222',
    borderRadius: 6,
    borderRadiusLG: 8,
    boxShadowSecondary: '0 16px 32px rgba(0, 0, 0, 0.3)',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      siderBg: '#0f0f0f',
      headerBg: 'transparent',
      triggerBg: '#111111',
      triggerColor: '#e5e5e5',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemColor: '#9ca3af',
      darkItemHoverColor: '#f5f5f5',
      darkItemSelectedBg: 'rgba(59, 130, 246, 0.12)',
      darkItemSelectedColor: '#93c5fd',
      itemBorderRadius: 8,
      itemHeight: 40,
    },
    Card: {
      colorBgContainer: '#111111',
      headerBg: 'transparent',
      borderRadiusLG: 10,
    },
    Button: {
      borderRadius: 8,
      fontWeight: 600,
      controlHeight: 38,
      controlHeightSM: 32,
      controlHeightLG: 42,
    },
    Input: {
      activeBorderColor: 'rgba(59, 130, 246, 0.35)',
      hoverBorderColor: 'rgba(59, 130, 246, 0.28)',
      colorBgContainer: '#151515',
    },
    Select: {
      colorBgContainer: '#151515',
      optionSelectedBg: 'rgba(59, 130, 246, 0.14)',
    },
    Table: {
      colorBgContainer: '#111111',
      colorFillAlter: '#141414',
      borderColor: '#222222',
      headerBg: '#141414',
      headerColor: '#d4d4d8',
      rowHoverBg: 'rgba(255, 255, 255, 0.03)',
    },
    Tag: {
      defaultBg: '#141414',
      defaultColor: '#d4d4d8',
    },
    Drawer: {
      colorBgElevated: '#0f0f0f',
    },
  },
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={appTheme}>
      {/* AntApp centralizes message/modal/notification context for the full ERP UI. */}
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  )
}
