import type { Person } from "../../types/friends"
import Button from "../common/Button"
import Badge from "../common/Badge"
import { CheckIcon, CloseIcon, UserPlusIcon } from "../icons"

interface PersonActionsProps {
  person: Person
  onAdd: (userId: string) => void
  onCancel: (requestId: string) => void
  onAccept: (requestId: string) => void
  onDecline: (requestId: string) => void
}

/** The right buttons for how the logged-in user relates to this person. */
export default function PersonActions({
  person,
  onAdd,
  onCancel,
  onAccept,
  onDecline,
}: PersonActionsProps) {
  const { status, requestId } = person.relationship

  switch (status) {
    case "friends":
      return <Badge tone="blue" size="md">Friends</Badge>

    case "request_sent":
      return (
        <Button variant="outline" onClick={() => requestId && onCancel(requestId)}>
          Cancel request
        </Button>
      )

    case "request_received":
      return (
        <>
          <Button onClick={() => requestId && onAccept(requestId)}>
            <CheckIcon className="w-4 h-4" />
            Accept
          </Button>
          <Button variant="outline" onClick={() => requestId && onDecline(requestId)}>
            <CloseIcon className="w-4 h-4" />
            Deny
          </Button>
        </>
      )

    default:
      return (
        <Button onClick={() => onAdd(person.id)}>
          <UserPlusIcon className="w-4 h-4" />
          Add friend
        </Button>
      )
  }
}
