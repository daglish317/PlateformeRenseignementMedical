export const DASHBOARD_LAYOUT = {
  sidebarWidth: 260,
  sidebarCollapsedWidth: 72,
  headerHeight: 64,
  contentPadding: 24,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
} as const;

export const DASHBOARD_SIDEBAR = {
  width: DASHBOARD_LAYOUT.sidebarWidth,
  collapsedWidth: DASHBOARD_LAYOUT.sidebarCollapsedWidth,
} as const;

export const DASHBOARD_HEADER = {
  height: DASHBOARD_LAYOUT.headerHeight,
} as const;
