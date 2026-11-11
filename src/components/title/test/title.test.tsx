// Internal imports
import Title from '../view/title.tsx'

// External Imports
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

test('renders Title component', () => {
  render(<Title />)
  expect(screen.getAllByRole('heading')).toHaveLength(2)
})
