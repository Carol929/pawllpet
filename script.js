document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = primaryNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (!href) return;
      var id = href.slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- i18n ---
  var translations = {
    en: {
      'nav.products': 'Products',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'auth.login': 'Login',
      'auth.signup': 'Sign Up',
      'hero.title': 'Happier Pets, Better Gear',
      'hero.subtitle': 'Curated toys, apparel, and leashes for every adventure together.',
      'cta.shop': 'Shop Now',
      'products.title': 'Featured Products',
      'products.toys.title': 'Toys',
      'products.toys.desc': 'Durable, safe toys for play, enrichment, and training.',
      'products.apparel.title': 'Apparel',
      'products.apparel.desc': 'Comfortable, stylish outfits for all seasons and sizes.',
      'products.leashes.title': 'Leashes & Walk',
      'products.leashes.desc': 'Leashes, harnesses, and walk essentials for safety and comfort.',
      'about.title': 'About Pawll',
      'about.desc': 'We are pet lovers dedicated to curating quality gear that's safe, durable, and delightful—so you can enjoy every moment with your pets.',
      'contact.title': 'Contact Us',
      'contact.desc': 'For partnerships or inquiries, reach us at:',
      'contact.email': 'Email:',
      'footer.allRights': 'All rights reserved.',
      'footer.backToTop': '↑ Back to top'
    },
    zh: {
      'nav.products': '用品',
      'nav.about': '关于我们',
      'nav.contact': '联系',
      'auth.login': '登录',
      'auth.signup': '注册',
      'hero.title': '让宠物更快乐，装备更出色',
      'hero.subtitle': '甄选玩具、衣服与牵引绳，陪你与爱宠每一次出行与互动。',
      'cta.shop': '立即选购',
      'products.title': '精选用品',
      'products.toys.title': '玩具',
      'products.toys.desc': '耐咬安全，适合互动、训练与益智玩耍。',
      'products.apparel.title': '衣服',
      'products.apparel.desc': '舒适有型，适配四季与不同体型。',
      'products.leashes.title': '牵引与出行',
      'products.leashes.desc': '牵引绳、胸背和出行必备，安心舒适。',
      'about.title': '关于 Pawll',
      'about.desc': '我们热爱宠物，专注甄选安全耐用、设计友好的用品，让你与爱宠尽享美好时光。',
      'contact.title': '联系我们',
      'contact.desc': '商务合作或咨询，欢迎通过以下方式联系：',
      'contact.email': '邮箱：',
      'contact.instagram': 'Instagram：',
      'contact.tiktok': 'TikTok：',
      'footer.allRights': '保留所有权利。',
      'footer.backToTop': '↑ 返回顶部'
    }
  };

  function applyTranslations(lang) {
    var dict = translations[lang] || translations.en;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = dict[key];
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.placeholder = lang === 'zh' ? '搜索商品' : 'Search products';
      searchInput.setAttribute('aria-label', searchInput.placeholder);
    }
    var langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.textContent = lang === 'zh' ? '中文' : 'EN';
      langToggle.dataset.lang = lang;
    }
  }

  // Default to English
  var initialLang = 'en';
  try {
    var saved = localStorage.getItem('pawll_lang');
    if (saved === 'en' || saved === 'zh') initialLang = saved;
  } catch (e) {}
  applyTranslations(initialLang);

  var langToggleBtn = document.getElementById('langToggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', function () {
      var next = (langToggleBtn.dataset.lang === 'en') ? 'zh' : 'en';
      applyTranslations(next);
      try { localStorage.setItem('pawll_lang', next); } catch (e) {}
    });
  }

  // --- search submit scroll to products ---
  var searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      // For now, just scroll to products; wire to real search later
      e.preventDefault();
      var products = document.getElementById('products');
      if (products) products.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- mock cart count increment when clicking category cards ---
  var cartCount = document.getElementById('cartCount');
  function incCart() {
    if (!cartCount) return;
    var n = parseInt(cartCount.textContent || '0', 10) || 0;
    cartCount.textContent = String(n + 1);
  }
  document.querySelectorAll('#products .grid-item').forEach(function (item) {
    item.addEventListener('click', function () { incCart(); });
    item.style.cursor = 'pointer';
  });
});


