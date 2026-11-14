import SmallBanner from '../view/smallBanner'

import { render, within } from '@testing-library/react'
import '@testing-library/jest-dom'

test('renders three banner cards with an icon and paragraph in each', () => {
 const { container } = render(<SmallBanner />)

 const bannerGrid = container.firstElementChild
 if (!bannerGrid) throw new Error('Banner grid not found')
 expect(bannerGrid.children).toHaveLength(3)

 for (const card of Array.from(bannerGrid.children)) {
  if (!(card instanceof HTMLElement)) throw new Error('Banner card is not an HTML element')
  expect(within(card).getAllByRole('presentation')).toHaveLength(1)
  expect(within(card).getByRole('presentation')).toHaveAttribute('src')
  expect(within(card).getAllByRole('paragraph')).toHaveLength(1)
 }
})
