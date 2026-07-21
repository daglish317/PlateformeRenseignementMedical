export const ADMIN_LAYOUT = {
  sidebarWidth: 260,
  sidebarCollapsedWidth: 72,
  headerHeight: 64,
  contentPadding: 24,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
} as const;

export const ADMIN_SIDEBAR = {
  width: ADMIN_LAYOUT.sidebarWidth,
  collapsedWidth: ADMIN_LAYOUT.sidebarCollapsedWidth,
} as const;

export const ADMIN_HEADER = {
  height: ADMIN_LAYOUT.headerHeight,
} as const;
