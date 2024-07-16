import React, { forwardRef } from "react";
import RouterContext from "../contexts/RouterContext";
import useNonNullableContext from "../hooks/useNonNullableContext";
import type { NavigateTo, NavigateOptions, NavigateArgs } from "../router";

type LinkProps<To, State> = React.ComponentProps<'a'> & NavigateOptions<To, State> & {
  to?: To
  replace?: boolean
}

function Link<To extends NavigateTo, State>({
  to,
  replace,
  search,
  hash,
  state,
  ...props
}: LinkProps<To, State>, ref: React.ForwardedRef<HTMLAnchorElement>) {
  let anchorProps: React.ComponentProps<'a'> = props,
    args = [{ search, hash, state }] as NavigateArgs<To, State>

  if ('params' in props) {
    const { params, ...rest } = props
    args = [{ search, hash, state, params }] as NavigateArgs<To, State>
    anchorProps = rest
  }

  const router = useNonNullableContext(RouterContext)
  const href = router.createHref(to, ...args)

  return (
    <a
      ref={ref}
      href={href}
      onClick={e => {
        e.preventDefault()
        if (replace) {
          router?.replace(to, ...args)
        } else {
          router?.push(to, ...args)
        }
      }}
      {...anchorProps}
    />
  )
}

export default forwardRef(Link) as typeof Link