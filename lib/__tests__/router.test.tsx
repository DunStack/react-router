import React from 'react'
import { render, screen } from '@testing-library/react'
import Router from '../router'

describe('Router', () => {
  it('should render Router', () => {
    render(<Router />)    
    expect(screen.getByText('@dunstack/router')).toBeInTheDocument()
  })
})