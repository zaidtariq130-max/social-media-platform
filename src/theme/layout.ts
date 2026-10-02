import type { ThemeLayout } from "./types"

export const layout = {

  breakpoint: 1024,

  gridColumns: "grid-cols-[auto_1fr]",

  
  sidebarWidthExpanded: "w-64",
  sidebarWidthCollapsed: "w-20",


  sidebarSlotMobile: "w-20",
  sidebarSlotExpanded: "lg:w-64",
  sidebarSlotCollapsed: "lg:w-20",

  headerHeight: "h-16",
  headerPadding: "px-4 sm:px-6",
  contentPadding: "p-4 sm:p-6 lg:p-8",

  
  sidebarOverlayHidden: "lg:hidden", 
  sidebarAsideFull: "lg:w-full", 
  sidebarShadowExpanded: "shadow-xl lg:shadow-none", 
} satisfies ThemeLayout
