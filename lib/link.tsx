import React, { forwardRef } from "react";
import { DynamicPath, hasNavigateParams, type NavigateOptions, type NavigateTo } from "./router";
import { useRouter } from "./hooks";

type PopLinkProps = {
  to: number
}

type NavigateLinkProps<To extends NavigateTo, State> = {
  to?: To | string
  replace?: boolean
} & NavigateOptions<To, State>

type LinkProps<To extends NavigateTo, State> = React.ComponentProps<'a'> & (PopLinkProps | NavigateLinkProps<To, State>)

function isPopLink<To extends NavigateTo, State>(props: PopLinkProps | NavigateLinkProps<To, State>): props is PopLinkProps {
  return typeof props.to === 'number'
}

function Link<To extends NavigateTo, State>(props: LinkProps<To, State>, ref: React.ForwardedRef<HTMLAnchorElement>) {
  const router = useRouter()
  
  let href: string, 
  restProps: React.ComponentProps<'a'>,
  navigate: () => void
  
  if (isPopLink(props)) {
    const { to, ...rest } = props
    href = ""
    navigate = () => router.go(to)
    restProps = rest
  } else {
    const { to = "", replace, ...otherProps } = props
    const navigateType = replace ? 'replace' : 'push'
    if (hasNavigateParams(to, otherProps)) {
      const { hash, search, state, params, ...rest } = otherProps
      const options: NavigateOptions<DynamicPath, State> = { hash, search, state, params }
      href = router.createHref(to, options)
      restProps = rest
      navigate = () => router[navigateType](to, options)
    } else {
      const { hash, search, state, ...rest } = otherProps
      const options: NavigateOptions<string, State> = { hash, search, state }
      href = router.createHref(to, options)
      restProps = rest
      navigate = () => router[navigateType](to, options)
    }
  }

  return (
    <a 
      ref={ref} 
      href={href} 
      onClick={e => {
        e.preventDefault()
        navigate()
      }}
      {...restProps} 
    />
  )
}

export default forwardRef(Link) as typeof Link