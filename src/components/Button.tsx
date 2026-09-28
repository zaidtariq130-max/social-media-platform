import type { ReactNode } from "react"

interface ButtonProp{
    children: ReactNode
    onClick: () => void

}


export default function Button({children,onClick}:ButtonProp) {
  return (
   <button onClick={onClick}>{children}</button>
  )
}
