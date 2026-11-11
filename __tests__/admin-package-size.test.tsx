/**
 * The package-size fields on the admin "Add Product" form: what the admin
 * types, and what is sent to the API as a result.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}))
vi.mock('@/components/admin/ImageCropper', () => ({ default: () => null }))

// Import AFTER mocking
import NewProduct from '@/app/admin/products/new/page'

const fetchMock = vi.fn()

function inputUnder(labelText: string): HTMLInputElement {
  const group = screen.getByText(labelText).closest('.admin-form-group')
  const input = group?.querySelector('input')
  if (!input) throw new Error(`no input under label "${labelText}"`)
  return input as HTMLInputElement
}

/** Fill everything the form requires apart from the package size. */
async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('e.g. Dog Fetch Toys'), 'Calming Bed')
  await user.type(screen.getByPlaceholderText('Product description...'), 'A soft bed.')
  await user.click(await screen.findByLabelText('Beds'))
  await user.click(screen.getByLabelText(/Dog/))
  // Number inputs are set directly: typing into one that already shows "0" appends to it.
  fireEvent.change(inputUnder('Price ($) *'), { target: { value: '29.99' } })
}

function postedProduct(): Record<string, unknown> {
  const call = fetchMock.mock.calls.find(([url, init]) => url === '/api/admin/products' && init?.method === 'POST')
  if (!call) throw new Error('the form did not POST to /api/admin/products')
  return JSON.parse(call[1].body as string)
}

beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST') return { ok: true, json: async () => ({ id: 'prod_new' }) }
    if (String(url).includes('/api/admin/categories')) {
      return { ok: true, json: async () => [{ id: 'cat_beds', name: 'Beds', slug: 'beds' }] }
    }
    return { ok: true, json: async () => ({}) }
  })
  vi.stubGlobal('fetch', fetchMock)
})

describe('Add Product form — package size', () => {
  it('sends a size typed in centimetres to the API in inches', async () => {
    const user = userEvent.setup()
    render(<NewProduct />)
    await fillRequiredFields(user)

    await user.type(screen.getByPlaceholderText('Length'), '40')
    await user.type(screen.getByPlaceholderText('Width'), '30')
    await user.type(screen.getByPlaceholderText('Height'), '15')
    await user.click(screen.getByRole('button', { name: 'Save Product' }))

    await waitFor(() => expect(postedProduct()).toBeTruthy())
    expect(postedProduct()).toMatchObject({ length: 15.75, width: 11.81, height: 5.91 })
  })

  it('sends null for all three when the size is left empty', async () => {
    const user = userEvent.setup()
    render(<NewProduct />)
    await fillRequiredFields(user)

    await user.click(screen.getByRole('button', { name: 'Save Product' }))

    await waitFor(() => expect(postedProduct()).toBeTruthy())
    expect(postedProduct()).toMatchObject({ length: null, width: null, height: null })
  })

  it('converts what is typed when switching to inches, and saves the inch values', async () => {
    const user = userEvent.setup()
    render(<NewProduct />)
    await fillRequiredFields(user)

    await user.type(screen.getByPlaceholderText('Length'), '25.4')
    await user.type(screen.getByPlaceholderText('Width'), '50.8')
    await user.type(screen.getByPlaceholderText('Height'), '12.7')
    await user.click(screen.getByRole('button', { name: 'in' }))

    expect(screen.getByPlaceholderText('Length')).toHaveValue(10)
    expect(screen.getByPlaceholderText('Width')).toHaveValue(20)
    expect(screen.getByPlaceholderText('Height')).toHaveValue(5)

    await user.click(screen.getByRole('button', { name: 'Save Product' }))
    await waitFor(() => expect(postedProduct()).toBeTruthy())
    expect(postedProduct()).toMatchObject({ length: 10, width: 20, height: 5 })
  })

  it('refuses to save a partly filled size and says why', async () => {
    const user = userEvent.setup()
    render(<NewProduct />)
    await fillRequiredFields(user)

    await user.type(screen.getByPlaceholderText('Length'), '40')
    await user.click(screen.getByRole('button', { name: 'Save Product' }))

    expect(await screen.findByText(/all three package dimensions/i)).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
  })
})
