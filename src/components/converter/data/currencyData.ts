// Internal imports
import type { Currency } from '../types/converterTypes'
import {
  USD, SGD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN, BRL,
  US_DOLLAR, SINGAPORE_DOLLAR, EURO, POUND_STERLING, JAPANESE_YEN,
  CANADIAN_DOLLAR, AUSTRALIAN_DOLLAR, SWISS_FRANC, CHINESE_YUAN,
  INDIAN_RUPEE, MEXICAN_PESO, BRAZILIAN_REAL,
} from '../../../constants/currencyNames'
import us from '../../../assets/countries/us.svg'
import sg from '../../../assets/countries/sg.svg'
import eu from '../../../assets/countries/eu.svg'
import gb from '../../../assets/countries/gb.svg'
import jp from '../../../assets/countries/jp.svg'
import ca from '../../../assets/countries/ca.svg'
import au from '../../../assets/countries/au.svg'
import ch from '../../../assets/countries/ch.svg'
import cn from '../../../assets/countries/cn.svg'
import inFlag from '../../../assets/countries/in.svg'
import mx from '../../../assets/countries/mx.svg'
import br from '../../../assets/countries/br.svg'

const ecbLink = (currency: string) =>
  `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A?lastNObservations=1`

export const currencyData: Currency[] = [
  { shortName: USD, currencyName: US_DOLLAR, logo: '$', currentValue: 1, country: 'United States', src: us, link: ecbLink(USD) },
  { shortName: SGD, currencyName: SINGAPORE_DOLLAR, logo: 'S$', currentValue: 1, country: 'Singapore', src: sg, link: ecbLink(SGD) },
  { shortName: EUR, currencyName: EURO, logo: '€', currentValue: 1, country: 'Eurozone', src: eu, link: ecbLink(USD) },
  { shortName: GBP, currencyName: POUND_STERLING, logo: '£', currentValue: 1, country: 'United Kingdom', src: gb, link: ecbLink(GBP) },
  { shortName: JPY, currencyName: JAPANESE_YEN, logo: '¥', currentValue: 1, country: 'Japan', src: jp, link: ecbLink(JPY) },
  { shortName: CAD, currencyName: CANADIAN_DOLLAR, logo: 'C$', currentValue: 1, country: 'Canada', src: ca, link: ecbLink(CAD) },
  { shortName: AUD, currencyName: AUSTRALIAN_DOLLAR, logo: 'A$', currentValue: 1, country: 'Australia', src: au, link: ecbLink(AUD) },
  { shortName: CHF, currencyName: SWISS_FRANC, logo: 'CHF', currentValue: 1, country: 'Switzerland', src: ch, link: ecbLink(CHF) },
  { shortName: CNY, currencyName: CHINESE_YUAN, logo: '¥', currentValue: 1, country: 'China', src: cn, link: ecbLink(CNY) },
  { shortName: INR, currencyName: INDIAN_RUPEE, logo: '₹', currentValue: 1, country: 'India', src: inFlag, link: ecbLink(INR) },
  { shortName: MXN, currencyName: MEXICAN_PESO, logo: 'MX$', currentValue: 1, country: 'Mexico', src: mx, link: ecbLink(MXN) },
  { shortName: BRL, currencyName: BRAZILIAN_REAL, logo: 'R$', currentValue: 1, country: 'Brazil', src: br, link: ecbLink(BRL) },
]