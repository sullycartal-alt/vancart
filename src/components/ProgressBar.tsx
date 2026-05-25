'use client'

import { AppProgressBar } from 'next-nprogress-bar'

export default function ProgressBar() {
  return (
    <AppProgressBar
      height="2px"
      color="#6C47FF"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
