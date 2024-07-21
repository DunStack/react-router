import React from "react"
import Router from "../router"
import { render, screen } from '@testing-library/react'

test('renders router', () => {
  render(<Router />)    
  expect(screen.getByText('@dunstack/router')).toBeInTheDocument()
})