import type { FolderType } from "../../../types/messages"
import Tabs, { type TabItem } from "../../common/Tabs"

interface Props {
  activeFolder: FolderType
  onChangeFolder: (folder: FolderType) => void
  blockedCount: number
  unreadGroupsCount: number
}

export default function FolderTabs({
  activeFolder,
  onChangeFolder,
  blockedCount,
  unreadGroupsCount,
}: Props) {
  const items: TabItem<FolderType>[] = [
    { id: "primary", label: "Primary" },
    {
      id: "groups",
      label: "Groups",
      badge: unreadGroupsCount > 0 ? { count: unreadGroupsCount, tone: "solidRose" } : undefined,
    },
    {
      id: "blocked",
      label: "Blocked",
      accent: "rose",
      badge: { count: blockedCount, tone: "rose" },
    },
  ]

  return <Tabs items={items} active={activeFolder} onChange={onChangeFolder} />
}
