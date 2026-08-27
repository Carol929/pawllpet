import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PasswordInput from '@/components/PasswordInput'

describe('PasswordInput', () => {
  it('renders masked by default with a "Show password" toggle', () => {
    render(<PasswordInput id="pw" placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
    const toggle = screen.getByRole('button', { name: /show password/i })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('type', 'button')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('reveals the value and re-hides it when the eye is toggled', async () => {
    const user = userEvent.setup()
    render(<PasswordInput id="pw" placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    const toggle = screen.getByRole('button', { name: /show password/i })

    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()

    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })

  it('passes through input props and stays a controlled input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PasswordInput id="loginPassword" placeholder="Password" value="" onChange={onChange} required minLength={8} />)
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('id', 'loginPassword')
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('minlength', '8')
    await user.type(input, 'x')
    expect(onChange).toHaveBeenCalled()
  })

  it('does not submit the surrounding form when the eye is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput id="pw" placeholder="Password" />
      </form>,
    )
    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
