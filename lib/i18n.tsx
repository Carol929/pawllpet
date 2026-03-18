'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'

export type Locale = 'en' | 'zh'

const STORAGE_KEY = 'pawll-locale'

const translations = {
  nav: {
    newArrivals: { en: 'New Arrivals', zh: '新品' },
    cats: { en: 'Cats', zh: '猫猫' },
    dogs: { en: 'Dogs', zh: '狗狗' },
    mysteryBoxes: { en: 'Mystery Boxes', zh: '盲盒' },
    forDogs: { en: 'For Dogs', zh: '狗狗专区' },
    forCats: { en: 'For Cats', zh: '猫猫专区' },
    allNew: { en: 'All New', zh: '全部新品' },
    toys: { en: 'Toys', zh: '玩具' },
    treats: { en: 'Treats', zh: '零食' },
    grooming: { en: 'Grooming', zh: '美容护理' },
    accessories: { en: 'Accessories', zh: '配饰' },
    beds: { en: 'Beds', zh: '宠物床' },
    apparel: { en: 'Apparel', zh: '服饰' },
    feeders: { en: 'Feeders & Bowls', zh: '食盆水碗' },
    travel: { en: 'Travel', zh: '出行装备' },
    dogBox: { en: 'Dog Box', zh: '狗狗盲盒' },
    catBox: { en: 'Cat Box', zh: '猫猫盲盒' },
    surpriseBox: { en: 'Surprise Box', zh: '惊喜盲盒' },
  },
  header: {
    searchPlaceholder: { en: 'Search products', zh: '搜索商品' },
    logIn: { en: 'Log In', zh: '登录' },
    signUp: { en: 'Sign Up', zh: '注册' },
    topBanner: { en: 'Free shipping over $65 • Earn Paw Points on every order', zh: '满$65免运费 · 每笔订单赚取爪印积分' },
    cartLabel: { en: 'Shopping cart', zh: '购物车' },
    openMenu: { en: 'Open menu', zh: '打开菜单' },
    closeMenu: { en: 'Close menu', zh: '关闭菜单' },
  },
  home: {
    featuredCollections: { en: 'Featured collections', zh: '精选系列' },
    newArrivals: { en: 'New arrivals', zh: '新品上架' },
    bestSellers: { en: 'Best sellers', zh: '热销商品' },
    explore: { en: 'Explore', zh: '探索' },
    viewDetails: { en: 'View details', zh: '查看详情' },
  },
  footer: {
    tagline: { en: 'Premium pet essentials with collectible drop energy.', zh: '精选宠物用品，限量发售的惊喜体验。' },
    shop: { en: 'Shop', zh: '商城' },
    shopAll: { en: 'Shop all', zh: '全部商品' },
    shopByPet: { en: 'Shop by pet', zh: '按宠物分类' },
    shopByNeed: { en: 'Shop by need', zh: '按需求分类' },
    help: { en: 'Help', zh: '帮助' },
    faq: { en: 'FAQ', zh: '常见问题' },
    helpCenter: { en: 'Help Center', zh: '帮助中心' },
    trackOrder: { en: 'Track order', zh: '订单追踪' },
    returns: { en: 'Returns', zh: '退换货' },
    follow: { en: 'Follow', zh: '关注我们' },
    contact: { en: 'Contact', zh: '联系我们' },
  },
} as const

type Section = keyof typeof translations
type Key<S extends Section> = keyof (typeof translations)[S]

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: <S extends Section>(section: S, key: Key<S>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'zh' || saved === 'en') {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const t = useCallback(<S extends Section>(section: S, key: Key<S>): string => {
    const entry = translations[section]?.[key] as { en: string; zh: string } | undefined
    if (!entry) return String(key)
    return entry[locale]
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
