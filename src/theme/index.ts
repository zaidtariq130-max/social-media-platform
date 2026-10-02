import { colors } from "./colors"
import { spacing } from "./spacing"
import { typography } from "./typography"
import { layout } from "./layout"
import type { Theme } from "./types"

export const theme: Theme = {
  colors,
  spacing,
  typography,
  layout,
}

export { colors, gradients } from "./colors"
export { spacing } from "./spacing"
export { typography } from "./typography"
export { layout } from "./layout"
export type * from "./types"

export default theme
