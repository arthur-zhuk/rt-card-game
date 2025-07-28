import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import GameTimer from '../GameTimer'

describe('GameTimer', () => {
  it('renders time remaining label', () => {
    render(<GameTimer timeRemaining={180} />)
    
    expect(screen.getByText('Time Remaining')).toBeInTheDocument()
  })

  it('formats time correctly for minutes and seconds', () => {
    render(<GameTimer timeRemaining={125} />)
    
    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  it('formats time correctly for exact minutes', () => {
    render(<GameTimer timeRemaining={120} />)
    
    expect(screen.getByText('2:00')).toBeInTheDocument()
  })

  it('formats time correctly for less than a minute', () => {
    render(<GameTimer timeRemaining={45} />)
    
    expect(screen.getByText('0:45')).toBeInTheDocument()
  })

  it('formats time correctly for single digit seconds', () => {
    render(<GameTimer timeRemaining={65} />)
    
    expect(screen.getByText('1:05')).toBeInTheDocument()
  })

  it('handles zero time', () => {
    render(<GameTimer timeRemaining={0} />)
    
    expect(screen.getByText('0:00')).toBeInTheDocument()
  })

  it('applies green styling for time > 60 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={90} />)
    
    expect(container.firstChild).toHaveClass('bg-green-500')
  })

  it('applies orange styling for time between 31-60 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={45} />)
    
    expect(container.firstChild).toHaveClass('bg-orange-500')
  })

  it('applies red styling and pulse animation for time <= 30 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={20} />)
    
    expect(container.firstChild).toHaveClass('bg-red-500', 'animate-pulse')
  })

  it('applies red styling for exactly 30 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={30} />)
    
    expect(container.firstChild).toHaveClass('bg-red-500', 'animate-pulse')
  })

  it('applies orange styling for exactly 60 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={60} />)
    
    expect(container.firstChild).toHaveClass('bg-orange-500')
  })

  it('applies green styling for exactly 61 seconds', () => {
    const { container } = render(<GameTimer timeRemaining={61} />)
    
    expect(container.firstChild).toHaveClass('bg-green-500')
  })

  it('always applies base classes', () => {
    const { container } = render(<GameTimer timeRemaining={100} />)
    
    expect(container.firstChild).toHaveClass(
      'text-center',
      'px-5',
      'py-2.5',
      'rounded-lg',
      'font-bold'
    )
  })

  it('handles negative time gracefully', () => {
    render(<GameTimer timeRemaining={-10} />)
    
    // Should still render without crashing
    expect(screen.getByText('Time Remaining')).toBeInTheDocument()
  })

  it('handles very large time values', () => {
    render(<GameTimer timeRemaining={3661} />)
    
    expect(screen.getByText('61:01')).toBeInTheDocument()
  })

  describe('time formatting edge cases', () => {
    it('formats 1 second correctly', () => {
      render(<GameTimer timeRemaining={1} />)
      expect(screen.getByText('0:01')).toBeInTheDocument()
    })

    it('formats 59 seconds correctly', () => {
      render(<GameTimer timeRemaining={59} />)
      expect(screen.getByText('0:59')).toBeInTheDocument()
    })

    it('formats 61 seconds correctly', () => {
      render(<GameTimer timeRemaining={61} />)
      expect(screen.getByText('1:01')).toBeInTheDocument()
    })

    it('formats 3600 seconds (1 hour) correctly', () => {
      render(<GameTimer timeRemaining={3600} />)
      expect(screen.getByText('60:00')).toBeInTheDocument()
    })
  })
})
