import React from 'react'
import Button from '../headless/Button'
import SignInModal from './SignInModal'

export interface SignInButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  socialLogin?: string[]
  onLoaded?: () => void
}

const SignInButton = (props: SignInButtonProps) => {
  const { children, socialLogin, onClick, ...reactProps } = props

  const [isOpen, setIsOpen] = React.useState(false)

  const _onClick = (e: any) => {
    setIsOpen(true)
    document.getElementsByTagName("html").item(0)?.setAttribute("style", "overflow: hidden;")
    onClick && onClick(e)
  }

  const onClose = () => {
    document.getElementsByTagName("html").item(0)?.setAttribute("style", "")
    setIsOpen(false)
  }

  return (
    <>
      <SignInModal socialLogin={socialLogin} isOpen={isOpen} onClose={onClose} />
      <Button onClick={_onClick} {...reactProps}>
        {children || <>Sign In</>}
      </Button>
    </>
  )
}
export default SignInButton
