import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'

describe('UI Components Tests', () => {
  describe('Button Component', () => {
    it('should render button with text', () => {
      render(<Button>Test Button</Button>)
      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
    })

    it('should handle click events', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>Click Me</Button>)
      
      await user.click(screen.getByRole('button', { name: 'Click Me' }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should apply variant classes correctly', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })
  })

  describe('Input Component', () => {
    it('should render input field', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should handle text input', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      await user.type(input, 'Test input')
      
      expect(input).toHaveValue('Test input')
    })

    it('should handle controlled input', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            placeholder="Controlled input"
          />
        )
      }
      
      render(<TestComponent />)
      const input = screen.getByPlaceholderText('Controlled input')
      expect(input).toHaveValue('')
    })
  })

  describe('Card Component', () => {
    it('should render card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test Content</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should apply correct CSS classes', () => {
      const { container } = render(
        <Card className="test-card">
          <CardContent>Content</CardContent>
        </Card>
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('test-card')
    })
  })
})