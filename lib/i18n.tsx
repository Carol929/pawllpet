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
    allProducts: { en: 'All Products', zh: '全部产品' },
    explore: { en: 'Explore', zh: '探索' },
    viewDetails: { en: 'View details', zh: '查看详情' },
  },
  auth: {
    logIn: { en: 'Log In', zh: '登录' },
    signUp: { en: 'Sign Up', zh: '注册' },
    emailOrUsername: { en: 'Email or Username', zh: '邮箱或用户名' },
    emailOrUsernamePlaceholder: { en: 'Enter your email or username', zh: '输入邮箱或用户名' },
    password: { en: 'Password', zh: '密码' },
    passwordPlaceholder: { en: 'Enter your password', zh: '输入密码' },
    confirmPassword: { en: 'Confirm Password', zh: '确认密码' },
    confirmPasswordPlaceholder: { en: 'Confirm your password', zh: '再次输入密码' },
    loggingIn: { en: 'Logging in...', zh: '登录中...' },
    forgotPassword: { en: 'Forgot password?', zh: '忘记密码？' },
    continueWithGoogle: { en: 'Continue with Google', zh: '使用 Google 登录' },
    signUpWithGoogle: { en: 'Sign up with Google', zh: '使用 Google 注册' },
    fullName: { en: 'Full Name', zh: '姓名' },
    fullNamePlaceholder: { en: 'Enter your full name', zh: '输入姓名' },
    email: { en: 'Email', zh: '邮箱' },
    emailPlaceholder: { en: 'Enter your email', zh: '输入邮箱' },
    petType: { en: 'Pet Type', zh: '宠物类型' },
    selectPetType: { en: 'Select pet type', zh: '选择宠物类型' },
    cat: { en: 'Cat', zh: '猫' },
    dog: { en: 'Dog', zh: '狗' },
    both: { en: 'Both', zh: '猫狗都有' },
    other: { en: 'Other', zh: '其他' },
    gender: { en: 'Gender', zh: '性别' },
    selectGender: { en: 'Select gender', zh: '选择性别' },
    male: { en: 'Male', zh: '男' },
    female: { en: 'Female', zh: '女' },
    otherGender: { en: 'Other', zh: '其他' },
    preferNotToSay: { en: 'Prefer not to say', zh: '不愿透露' },
    birthday: { en: 'Birthday', zh: '生日' },
    phone: { en: 'Phone', zh: '手机号' },
    phonePlaceholder: { en: 'Enter your phone number', zh: '输入手机号' },
    creatingAccount: { en: 'Creating account...', zh: '创建账户中...' },
    codeSent: { en: 'Verification code sent!', zh: '验证码已发送！' },
    sendCode: { en: 'Send verification code', zh: '发送验证码' },
    sending: { en: 'Sending...', zh: '发送中...' },
    verificationCode: { en: '6-digit code', zh: '6位验证码' },
    newPasswordOptional: { en: 'New password (optional)', zh: '新密码（可选）' },
    newPasswordPlaceholder: { en: 'Leave blank to keep current', zh: '留空则保持不变' },
    verifying: { en: 'Verifying...', zh: '验证中...' },
    verifyAndLogin: { en: 'Verify & Log In', zh: '验证并登录' },
    backToLogin: { en: 'Back to login', zh: '返回登录' },
    backToHome: { en: 'Back to Home', zh: '返回首页' },
    verifyEmail: { en: 'Verify your email', zh: '验证邮箱' },
    verifyEmailDesc: { en: 'Enter the 6-digit code sent to your email.', zh: '请输入发送到您邮箱的6位验证码。' },
    emailVerified: { en: 'Email verified! Redirecting...', zh: '邮箱验证成功！正在跳转...' },
    verify: { en: 'Verify', zh: '验证' },
    resendCode: { en: 'Resend code', zh: '重新发送验证码' },
    setPassword: { en: 'Set your password', zh: '设置密码' },
    setPasswordDesc: { en: 'Create a secure password for your PawLL Pet account.', zh: '为您的PawLL Pet账户创建安全密码。' },
    setPasswordBtn: { en: 'Set Password & Continue', zh: '设置密码并继续' },
    setting: { en: 'Setting...', zh: '设置中...' },
    passwordsMismatch: { en: 'Passwords do not match', zh: '两次密码不一致' },
    googlePasswordHint: { en: 'You signed in with Google. Set a password to also log in with email and password.', zh: '你通过 Google 登录。设置密码后也可以用邮箱密码登录。' },
    setPasswordAccount: { en: 'Set Password', zh: '设置密码' },
  },
  userMenu: {
    myAccount: { en: 'My Account', zh: '我的账户' },
    orderHistory: { en: 'Order History', zh: '订单历史' },
    settings: { en: 'Settings', zh: '设置' },
    logOut: { en: 'Log Out', zh: '退出登录' },
  },
  account: {
    loading: { en: 'Loading...', zh: '加载中...' },
    profile: { en: 'Profile', zh: '个人资料' },
    orders: { en: 'Order History', zh: '订单历史' },
    addresses: { en: 'Addresses', zh: '收货地址' },
    rewards: { en: 'Rewards', zh: '积分奖励' },
    securitySettings: { en: 'Security', zh: '安全设置' },
    editProfile: { en: 'Edit Profile', zh: '编辑资料' },
    save: { en: 'Save', zh: '保存' },
    saving: { en: 'Saving...', zh: '保存中...' },
    cancel: { en: 'Cancel', zh: '取消' },
    profileUpdated: { en: 'Profile updated!', zh: '资料已更新！' },
    changePassword: { en: 'Change Password', zh: '修改密码' },
    currentPassword: { en: 'Current Password', zh: '当前密码' },
    newPassword: { en: 'New Password', zh: '新密码' },
    passwordChanged: { en: 'Password changed!', zh: '密码已修改！' },
    noOrders: { en: 'No orders yet', zh: '暂无订单' },
    noAddresses: { en: 'No saved addresses', zh: '暂无收货地址' },
    pawPoints: { en: 'Paw Points', zh: '爪印积分' },
    pawPointsDesc: { en: 'Earn points on every order and redeem for rewards!', zh: '每笔订单都可赚取积分，兑换奖励！' },
  },
  pages: {
    shopByPet: { en: 'Shop by Pet', zh: '按宠物分类' },
    shopByPetDesc: { en: 'Find the perfect products for your furry friend', zh: '为你的毛孩子找到完美的产品' },
    dogs: { en: 'Dogs', zh: '狗狗' },
    cats: { en: 'Cats', zh: '猫猫' },
    allPets: { en: 'All Pets', zh: '所有宠物' },
    shopByNeed: { en: 'Shop by Need', zh: '按需求分类' },
    shopByNeedDesc: { en: 'Browse products by category', zh: '按类别浏览产品' },
    mysteryBoxes: { en: 'Mystery Boxes', zh: '惊喜盲盒' },
    mysteryBoxesDesc: { en: 'Monthly themed boxes with surprise pet-safe picks', zh: '每月主题盒子，精选宠物安全惊喜好物' },
    mysteryBoxesSoon: { en: 'Mystery boxes coming soon! Stay tuned.', zh: '惊喜盲盒即将上线！敬请期待。' },
    mbSurprise: { en: 'Surprise Picks', zh: '惊喜好物' },
    mbSurpriseDesc: { en: 'Curated pet-safe products in every box', zh: '每个盒子都有精选的宠物安全产品' },
    mbThemed: { en: 'Monthly Themes', zh: '每月主题' },
    mbThemedDesc: { en: 'New themes every month to keep things fresh', zh: '每月新主题，保持新鲜感' },
    mbRewards: { en: 'Earn Paw Points', zh: '赚取爪印积分' },
    mbRewardsDesc: { en: 'Loyalty multipliers on every mystery box order', zh: '每笔盲盒订单享受积分倍增' },
    noProductsFound: { en: 'No products found. Check back soon!', zh: '暂无产品，请稍后再来！' },
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
