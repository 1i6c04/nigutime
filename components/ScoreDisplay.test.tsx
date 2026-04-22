import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreDisplay } from './ScoreDisplay'

describe('ScoreDisplay', () => {
  it('renders score as 功德值', () => {
    render(<ScoreDisplay score={42} />)
    expect(screen.getByText('功德值：42')).toBeInTheDocument()
  })

  it('shows 0 at game start', () => {
    render(<ScoreDisplay score={0} />)
    expect(screen.getByText('功德值：0')).toBeInTheDocument()
  })
})
