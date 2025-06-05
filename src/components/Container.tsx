import type React from "react"

type ContainerProps = {
  children: React.ReactNode
  title?: string
}

const Container: React.FC<ContainerProps> = ({ children, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  )
}

export default Container
