'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'

export type Locale = 'en' | 'zh' | 'es' | 'fr' | 'ja' | 'ko'

const STORAGE_KEY = 'pawll-locale'

const translations = {
  nav: {
    newArrivals: { en: 'New Arrivals', zh: '新品', es: 'Novedades', fr: 'Nouveautés', ja: '新着商品', ko: '신상품' },
    cats: { en: 'Cats', zh: '猫猫', es: 'Gatos', fr: 'Chats', ja: '猫', ko: '고양이' },
    dogs: { en: 'Dogs', zh: '狗狗', es: 'Perros', fr: 'Chiens', ja: '犬', ko: '강아지' },
    mysteryBoxes: { en: 'Mystery Boxes', zh: '盲盒', es: 'Cajas sorpresa', fr: 'Boîtes mystère', ja: 'ミステリーボックス', ko: '미스터리 박스' },
    forDogs: { en: 'For Dogs', zh: '狗狗专区', es: 'Para perros', fr: 'Pour chiens', ja: '犬用', ko: '강아지용' },
    forCats: { en: 'For Cats', zh: '猫猫专区', es: 'Para gatos', fr: 'Pour chats', ja: '猫用', ko: '고양이용' },
    allNew: { en: 'All New', zh: '全部新品', es: 'Todo lo nuevo', fr: 'Toutes les nouveautés', ja: 'すべての新着', ko: '모든 신상품' },
    toys: { en: 'Toys', zh: '玩具', es: 'Juguetes', fr: 'Jouets', ja: 'おもちゃ', ko: '장난감' },
    treats: { en: 'Treats', zh: '零食', es: 'Premios', fr: 'Friandises', ja: 'おやつ', ko: '간식' },
    grooming: { en: 'Grooming', zh: '美容护理', es: 'Aseo', fr: 'Toilettage', ja: 'グルーミング', ko: '그루밍' },
    accessories: { en: 'Accessories', zh: '配饰', es: 'Accesorios', fr: 'Accessoires', ja: 'アクセサリー', ko: '액세서리' },
    beds: { en: 'Beds', zh: '宠物床', es: 'Camas', fr: 'Lits', ja: 'ベッド', ko: '침대' },
    apparel: { en: 'Apparel', zh: '服饰', es: 'Ropa', fr: 'Vêtements', ja: 'アパレル', ko: '의류' },
    feeders: { en: 'Feeders & Bowls', zh: '食盆水碗', es: 'Comederos y cuencos', fr: 'Gamelles et bols', ja: 'フィーダー・ボウル', ko: '급식기 & 그릇' },
    travel: { en: 'Travel', zh: '出行装备', es: 'Viaje', fr: 'Voyage', ja: 'トラベル', ko: '여행용품' },
    dogBox: { en: 'Dog Box', zh: '狗狗盲盒', es: 'Caja para perros', fr: 'Boîte chien', ja: '犬用ボックス', ko: '강아지 박스' },
    catBox: { en: 'Cat Box', zh: '猫猫盲盒', es: 'Caja para gatos', fr: 'Boîte chat', ja: '猫用ボックス', ko: '고양이 박스' },
    surpriseBox: { en: 'Surprise Box', zh: '惊喜盲盒', es: 'Caja sorpresa', fr: 'Boîte surprise', ja: 'サプライズボックス', ko: '서프라이즈 박스' },
  },
  header: {
    searchPlaceholder: { en: 'Search products', zh: '搜索商品', es: 'Buscar productos', fr: 'Rechercher des produits', ja: '商品を検索', ko: '상품 검색' },
    logIn: { en: 'Log In', zh: '登录', es: 'Iniciar sesión', fr: 'Se connecter', ja: 'ログイン', ko: '로그인' },
    signUp: { en: 'Sign Up', zh: '注册', es: 'Registrarse', fr: "S'inscrire", ja: '新規登録', ko: '회원가입' },
    topBanner: { en: 'Free shipping over $50 • Earn Paw Points on every order', zh: '满$50免运费 · 每笔订单赚取爪印积分', es: 'Envío gratis en pedidos de más de $50 • Gana Paw Points', fr: 'Livraison gratuite dès 50 $ • Gagnez des Paw Points', ja: '$50以上で送料無料 • Paw Points獲得', ko: '$50 이상 무료 배송 • Paw Points 적립' },
    cartLabel: { en: 'Shopping cart', zh: '购物车', es: 'Carrito', fr: 'Panier', ja: 'カート', ko: '장바구니' },
    openMenu: { en: 'Open menu', zh: '打开菜单', es: 'Abrir menú', fr: 'Ouvrir le menu', ja: 'メニューを開く', ko: '메뉴 열기' },
    closeMenu: { en: 'Close menu', zh: '关闭菜单', es: 'Cerrar menú', fr: 'Fermer le menu', ja: 'メニューを閉じる', ko: '메뉴 닫기' },
  },
  home: {
    featuredCollections: { en: 'Featured collections', zh: '精选系列', es: 'Colecciones destacadas', fr: 'Collections en vedette', ja: '注目のコレクション', ko: '추천 컬렉션' },
    newArrivals: { en: 'New arrivals', zh: '新品上架', es: 'Novedades', fr: 'Nouveautés', ja: '新着商品', ko: '신상품' },
    bestSellers: { en: 'Best sellers', zh: '热销商品', es: 'Más vendidos', fr: 'Meilleures ventes', ja: 'ベストセラー', ko: '베스트셀러' },
    allProducts: { en: 'All Products', zh: '全部产品', es: 'Todos los productos', fr: 'Tous les produits', ja: 'すべての商品', ko: '전체 상품' },
    explore: { en: 'Explore', zh: '探索', es: 'Explorar', fr: 'Explorer', ja: '探索する', ko: '탐색' },
    viewDetails: { en: 'View details', zh: '查看详情', es: 'Ver detalles', fr: 'Voir les détails', ja: '詳細を見る', ko: '상세 보기' },
  },
  auth: {
    logIn: { en: 'Log In', zh: '登录', es: 'Iniciar sesión', fr: 'Se connecter', ja: 'ログイン', ko: '로그인' },
    signUp: { en: 'Sign Up', zh: '注册', es: 'Registrarse', fr: "S'inscrire", ja: '新規登録', ko: '회원가입' },
    emailOrUsername: { en: 'Email or Username', zh: '邮箱或用户名', es: 'Correo o usuario', fr: "E-mail ou nom d'utilisateur", ja: 'メールまたはユーザー名', ko: '이메일 또는 사용자명' },
    emailOrUsernamePlaceholder: { en: 'Enter your email or username', zh: '输入邮箱或用户名', es: 'Ingresa tu correo o usuario', fr: "Entrez votre e-mail ou nom d'utilisateur", ja: 'メールまたはユーザー名を入力', ko: '이메일 또는 사용자명 입력' },
    password: { en: 'Password', zh: '密码', es: 'Contraseña', fr: 'Mot de passe', ja: 'パスワード', ko: '비밀번호' },
    passwordPlaceholder: { en: 'Enter your password', zh: '输入密码', es: 'Ingresa tu contraseña', fr: 'Entrez votre mot de passe', ja: 'パスワードを入力', ko: '비밀번호 입력' },
    confirmPassword: { en: 'Confirm Password', zh: '确认密码', es: 'Confirmar contraseña', fr: 'Confirmer le mot de passe', ja: 'パスワード確認', ko: '비밀번호 확인' },
    confirmPasswordPlaceholder: { en: 'Confirm your password', zh: '再次输入密码', es: 'Confirma tu contraseña', fr: 'Confirmez votre mot de passe', ja: 'パスワードを再入力', ko: '비밀번호 다시 입력' },
    loggingIn: { en: 'Logging in...', zh: '登录中...', es: 'Iniciando sesión...', fr: 'Connexion...', ja: 'ログイン中...', ko: '로그인 중...' },
    forgotPassword: { en: 'Forgot password?', zh: '忘记密码？', es: '¿Olvidaste tu contraseña?', fr: 'Mot de passe oublié ?', ja: 'パスワードをお忘れですか？', ko: '비밀번호를 잊으셨나요?' },
    continueWithGoogle: { en: 'Continue with Google', zh: '使用 Google 登录', es: 'Continuar con Google', fr: 'Continuer avec Google', ja: 'Googleで続行', ko: 'Google로 계속' },
    signUpWithGoogle: { en: 'Sign up with Google', zh: '使用 Google 注册', es: 'Registrarse con Google', fr: "S'inscrire avec Google", ja: 'Googleで登録', ko: 'Google로 가입' },
    fullName: { en: 'Full Name', zh: '姓名', es: 'Nombre completo', fr: 'Nom complet', ja: '氏名', ko: '이름' },
    fullNamePlaceholder: { en: 'Enter your full name', zh: '输入姓名', es: 'Ingresa tu nombre completo', fr: 'Entrez votre nom complet', ja: '氏名を入力', ko: '이름 입력' },
    email: { en: 'Email', zh: '邮箱', es: 'Correo electrónico', fr: 'E-mail', ja: 'メールアドレス', ko: '이메일' },
    emailPlaceholder: { en: 'Enter your email', zh: '输入邮箱', es: 'Ingresa tu correo', fr: 'Entrez votre e-mail', ja: 'メールアドレスを入力', ko: '이메일 입력' },
    petType: { en: 'Pet Type', zh: '宠物类型', es: 'Tipo de mascota', fr: "Type d'animal", ja: 'ペットの種類', ko: '반려동물 종류' },
    selectPetType: { en: 'Select pet type', zh: '选择宠物类型', es: 'Selecciona tipo', fr: "Sélectionnez le type", ja: '種類を選択', ko: '종류 선택' },
    cat: { en: 'Cat', zh: '猫', es: 'Gato', fr: 'Chat', ja: '猫', ko: '고양이' },
    dog: { en: 'Dog', zh: '狗', es: 'Perro', fr: 'Chien', ja: '犬', ko: '강아지' },
    both: { en: 'Both', zh: '猫狗都有', es: 'Ambos', fr: 'Les deux', ja: '両方', ko: '둘 다' },
    other: { en: 'Other', zh: '其他', es: 'Otro', fr: 'Autre', ja: 'その他', ko: '기타' },
    gender: { en: 'Gender', zh: '性别', es: 'Género', fr: 'Genre', ja: '性別', ko: '성별' },
    selectGender: { en: 'Select gender', zh: '选择性别', es: 'Selecciona género', fr: 'Sélectionnez le genre', ja: '性別を選択', ko: '성별 선택' },
    male: { en: 'Male', zh: '男', es: 'Masculino', fr: 'Homme', ja: '男性', ko: '남성' },
    female: { en: 'Female', zh: '女', es: 'Femenino', fr: 'Femme', ja: '女性', ko: '여성' },
    otherGender: { en: 'Other', zh: '其他', es: 'Otro', fr: 'Autre', ja: 'その他', ko: '기타' },
    preferNotToSay: { en: 'Prefer not to say', zh: '不愿透露', es: 'Prefiero no decir', fr: 'Je préfère ne pas dire', ja: '回答しない', ko: '밝히지 않음' },
    birthday: { en: 'Birthday', zh: '生日', es: 'Fecha de nacimiento', fr: 'Date de naissance', ja: '生年月日', ko: '생년월일' },
    phone: { en: 'Phone', zh: '手机号', es: 'Teléfono', fr: 'Téléphone', ja: '電話番号', ko: '전화번호' },
    phonePlaceholder: { en: 'Enter your phone number', zh: '输入手机号', es: 'Ingresa tu teléfono', fr: 'Entrez votre téléphone', ja: '電話番号を入力', ko: '전화번호 입력' },
    creatingAccount: { en: 'Creating account...', zh: '创建账户中...', es: 'Creando cuenta...', fr: 'Création du compte...', ja: 'アカウント作成中...', ko: '계정 생성 중...' },
    codeSent: { en: 'Verification code sent!', zh: '验证码已发送！', es: '¡Código enviado!', fr: 'Code envoyé !', ja: '認証コード送信済み！', ko: '인증 코드 전송 완료!' },
    sendCode: { en: 'Send verification code', zh: '发送验证码', es: 'Enviar código', fr: 'Envoyer le code', ja: '認証コードを送信', ko: '인증 코드 보내기' },
    sending: { en: 'Sending...', zh: '发送中...', es: 'Enviando...', fr: 'Envoi...', ja: '送信中...', ko: '전송 중...' },
    verificationCode: { en: '6-digit code', zh: '6位验证码', es: 'Código de 6 dígitos', fr: 'Code à 6 chiffres', ja: '6桁のコード', ko: '6자리 코드' },
    newPasswordOptional: { en: 'New password (optional)', zh: '新密码（可选）', es: 'Nueva contraseña (opcional)', fr: 'Nouveau mot de passe (optionnel)', ja: '新しいパスワード（任意）', ko: '새 비밀번호 (선택)' },
    newPasswordPlaceholder: { en: 'Leave blank to keep current', zh: '留空则保持不变', es: 'Dejar en blanco para mantener', fr: 'Laisser vide pour conserver', ja: '変更しない場合は空欄', ko: '유지하려면 비워두세요' },
    verifying: { en: 'Verifying...', zh: '验证中...', es: 'Verificando...', fr: 'Vérification...', ja: '確認中...', ko: '인증 중...' },
    verifyAndLogin: { en: 'Verify & Log In', zh: '验证并登录', es: 'Verificar e iniciar sesión', fr: 'Vérifier et se connecter', ja: '確認してログイン', ko: '인증 후 로그인' },
    backToLogin: { en: 'Back to login', zh: '返回登录', es: 'Volver al login', fr: 'Retour à la connexion', ja: 'ログインに戻る', ko: '로그인으로 돌아가기' },
    backToHome: { en: 'Back to Home', zh: '返回首页', es: 'Volver al inicio', fr: "Retour à l'accueil", ja: 'ホームに戻る', ko: '홈으로 돌아가기' },
    verifyEmail: { en: 'Verify your email', zh: '验证邮箱', es: 'Verifica tu correo', fr: 'Vérifiez votre e-mail', ja: 'メール確認', ko: '이메일 인증' },
    verifyEmailDesc: { en: 'Enter the 6-digit code sent to your email.', zh: '请输入发送到您邮箱的6位验证码。', es: 'Ingresa el código de 6 dígitos enviado a tu correo.', fr: 'Entrez le code à 6 chiffres envoyé à votre e-mail.', ja: 'メールに送信された6桁のコードを入力してください。', ko: '이메일로 전송된 6자리 코드를 입력하세요.' },
    emailVerified: { en: 'Email verified! Redirecting...', zh: '邮箱验证成功！正在跳转...', es: '¡Correo verificado! Redirigiendo...', fr: 'E-mail vérifié ! Redirection...', ja: 'メール確認完了！リダイレクト中...', ko: '이메일 인증 완료! 이동 중...' },
    verify: { en: 'Verify', zh: '验证', es: 'Verificar', fr: 'Vérifier', ja: '確認', ko: '인증' },
    resendCode: { en: 'Resend code', zh: '重新发送验证码', es: 'Reenviar código', fr: 'Renvoyer le code', ja: 'コードを再送信', ko: '코드 재전송' },
    setPassword: { en: 'Set your password', zh: '设置密码', es: 'Establece tu contraseña', fr: 'Définissez votre mot de passe', ja: 'パスワードを設定', ko: '비밀번호 설정' },
    setPasswordDesc: { en: 'Create a secure password for your PawLL Pet account.', zh: '为您的PawLL Pet账户创建安全密码。', es: 'Crea una contraseña segura para tu cuenta.', fr: 'Créez un mot de passe sécurisé pour votre compte.', ja: 'アカウントの安全なパスワードを作成してください。', ko: '계정의 안전한 비밀번호를 만드세요.' },
    setPasswordBtn: { en: 'Set Password & Continue', zh: '设置密码并继续', es: 'Establecer contraseña y continuar', fr: 'Définir et continuer', ja: 'パスワードを設定して続行', ko: '비밀번호 설정 후 계속' },
    setting: { en: 'Setting...', zh: '设置中...', es: 'Configurando...', fr: 'Configuration...', ja: '設定中...', ko: '설정 중...' },
    passwordsMismatch: { en: 'Passwords do not match', zh: '两次密码不一致', es: 'Las contraseñas no coinciden', fr: 'Les mots de passe ne correspondent pas', ja: 'パスワードが一致しません', ko: '비밀번호가 일치하지 않습니다' },
    googlePasswordHint: { en: 'You signed in with Google. Set a password to also log in with email and password.', zh: '你通过 Google 登录。设置密码后也可以用邮箱密码登录。', es: 'Iniciaste sesión con Google. Establece una contraseña para también usar correo y contraseña.', fr: 'Vous vous êtes connecté avec Google. Définissez un mot de passe pour aussi utiliser e-mail et mot de passe.', ja: 'Googleでサインインしました。パスワードを設定するとメールでもログインできます。', ko: 'Google로 로그인하셨습니다. 비밀번호를 설정하면 이메일로도 로그인 가능합니다.' },
    setPasswordAccount: { en: 'Set Password', zh: '设置密码', es: 'Establecer contraseña', fr: 'Définir le mot de passe', ja: 'パスワードを設定', ko: '비밀번호 설정' },
  },
  userMenu: {
    myAccount: { en: 'My Account', zh: '我的账户', es: 'Mi cuenta', fr: 'Mon compte', ja: 'マイアカウント', ko: '내 계정' },
    orderHistory: { en: 'Order History', zh: '订单历史', es: 'Historial de pedidos', fr: 'Historique des commandes', ja: '注文履歴', ko: '주문 내역' },
    settings: { en: 'Settings', zh: '设置', es: 'Configuración', fr: 'Paramètres', ja: '設定', ko: '설정' },
    logOut: { en: 'Log Out', zh: '退出登录', es: 'Cerrar sesión', fr: 'Se déconnecter', ja: 'ログアウト', ko: '로그아웃' },
  },
  account: {
    loading: { en: 'Loading...', zh: '加载中...', es: 'Cargando...', fr: 'Chargement...', ja: '読み込み中...', ko: '로딩 중...' },
    profile: { en: 'Profile', zh: '个人资料', es: 'Perfil', fr: 'Profil', ja: 'プロフィール', ko: '프로필' },
    orders: { en: 'Order History', zh: '订单历史', es: 'Historial de pedidos', fr: 'Historique des commandes', ja: '注文履歴', ko: '주문 내역' },
    addresses: { en: 'Addresses', zh: '收货地址', es: 'Direcciones', fr: 'Adresses', ja: '住所', ko: '주소' },
    rewards: { en: 'Rewards', zh: '积分奖励', es: 'Recompensas', fr: 'Récompenses', ja: 'リワード', ko: '리워드' },
    securitySettings: { en: 'Security', zh: '安全设置', es: 'Seguridad', fr: 'Sécurité', ja: 'セキュリティ', ko: '보안' },
    editProfile: { en: 'Edit Profile', zh: '编辑资料', es: 'Editar perfil', fr: 'Modifier le profil', ja: 'プロフィール編集', ko: '프로필 편집' },
    save: { en: 'Save', zh: '保存', es: 'Guardar', fr: 'Enregistrer', ja: '保存', ko: '저장' },
    saving: { en: 'Saving...', zh: '保存中...', es: 'Guardando...', fr: 'Enregistrement...', ja: '保存中...', ko: '저장 중...' },
    cancel: { en: 'Cancel', zh: '取消', es: 'Cancelar', fr: 'Annuler', ja: 'キャンセル', ko: '취소' },
    profileUpdated: { en: 'Profile updated!', zh: '资料已更新！', es: '¡Perfil actualizado!', fr: 'Profil mis à jour !', ja: 'プロフィール更新！', ko: '프로필 업데이트 완료!' },
    changePassword: { en: 'Change Password', zh: '修改密码', es: 'Cambiar contraseña', fr: 'Changer le mot de passe', ja: 'パスワード変更', ko: '비밀번호 변경' },
    currentPassword: { en: 'Current Password', zh: '当前密码', es: 'Contraseña actual', fr: 'Mot de passe actuel', ja: '現在のパスワード', ko: '현재 비밀번호' },
    newPassword: { en: 'New Password', zh: '新密码', es: 'Nueva contraseña', fr: 'Nouveau mot de passe', ja: '新しいパスワード', ko: '새 비밀번호' },
    passwordChanged: { en: 'Password changed!', zh: '密码已修改！', es: '¡Contraseña cambiada!', fr: 'Mot de passe modifié !', ja: 'パスワード変更完了！', ko: '비밀번호 변경 완료!' },
    noOrders: { en: 'No orders yet', zh: '暂无订单', es: 'Aún no hay pedidos', fr: 'Aucune commande', ja: 'まだ注文がありません', ko: '아직 주문이 없습니다' },
    noAddresses: { en: 'No saved addresses', zh: '暂无收货地址', es: 'No hay direcciones', fr: 'Aucune adresse', ja: '保存された住所なし', ko: '저장된 주소 없음' },
    pawPoints: { en: 'Paw Points', zh: '爪印积分', es: 'Paw Points', fr: 'Paw Points', ja: 'Paw Points', ko: 'Paw Points' },
    pawPointsDesc: { en: 'Earn points on every order and redeem for rewards!', zh: '每笔订单都可赚取积分，兑换奖励！', es: '¡Gana puntos en cada pedido y canjéalos!', fr: 'Gagnez des points à chaque commande !', ja: '毎回の注文でポイント獲得！', ko: '모든 주문에서 포인트 적립!' },
  },
  pages: {
    shopByPet: { en: 'Shop by Pet', zh: '按宠物分类', es: 'Comprar por mascota', fr: 'Acheter par animal', ja: 'ペットで探す', ko: '반려동물별' },
    shopByPetDesc: { en: 'Find the perfect products for your furry friend', zh: '为你的毛孩子找到完美的产品', es: 'Encuentra los productos perfectos', fr: 'Trouvez les produits parfaits', ja: 'ぴったりの商品を見つけよう', ko: '딱 맞는 상품을 찾아보세요' },
    dogs: { en: 'Dogs', zh: '狗狗', es: 'Perros', fr: 'Chiens', ja: '犬', ko: '강아지' },
    cats: { en: 'Cats', zh: '猫猫', es: 'Gatos', fr: 'Chats', ja: '猫', ko: '고양이' },
    allPets: { en: 'All Pets', zh: '所有宠物', es: 'Todas las mascotas', fr: 'Tous les animaux', ja: 'すべてのペット', ko: '모든 반려동물' },
    shopByNeed: { en: 'Shop by Need', zh: '按需求分类', es: 'Comprar por necesidad', fr: 'Acheter par besoin', ja: 'ニーズで探す', ko: '필요별' },
    shopByNeedDesc: { en: 'Browse products by category', zh: '按类别浏览产品', es: 'Explora por categoría', fr: 'Parcourir par catégorie', ja: 'カテゴリーで探す', ko: '카테고리별로 보기' },
    mysteryBoxes: { en: 'Mystery Boxes', zh: '惊喜盲盒', es: 'Cajas sorpresa', fr: 'Boîtes mystère', ja: 'ミステリーボックス', ko: '미스터리 박스' },
    mysteryBoxesDesc: { en: 'Monthly themed boxes with surprise pet-safe picks', zh: '每月主题盒子，精选宠物安全惊喜好物', es: 'Cajas temáticas mensuales con sorpresas', fr: 'Boîtes thématiques mensuelles', ja: '毎月届くサプライズボックス', ko: '매월 테마별 서프라이즈 박스' },
    mysteryBoxesSoon: { en: 'Mystery boxes coming soon! Stay tuned.', zh: '惊喜盲盒即将上线！敬请期待。', es: '¡Próximamente! Mantente atento.', fr: 'Bientôt disponible !', ja: '近日公開！お楽しみに。', ko: '곧 출시! 기대해 주세요.' },
    mbSurprise: { en: 'Surprise Picks', zh: '惊喜好物', es: 'Selecciones sorpresa', fr: 'Sélections surprises', ja: 'サプライズ商品', ko: '서프라이즈 상품' },
    mbSurpriseDesc: { en: 'Curated pet-safe products in every box', zh: '每个盒子都有精选的宠物安全产品', es: 'Productos seleccionados en cada caja', fr: 'Produits sélectionnés dans chaque boîte', ja: '各ボックスに厳選商品', ko: '모든 박스에 엄선 상품' },
    mbThemed: { en: 'Monthly Themes', zh: '每月主题', es: 'Temas mensuales', fr: 'Thèmes mensuels', ja: '月替わりテーマ', ko: '월간 테마' },
    mbThemedDesc: { en: 'New themes every month to keep things fresh', zh: '每月新主题，保持新鲜感', es: 'Nuevos temas cada mes', fr: 'Nouveaux thèmes chaque mois', ja: '毎月新しいテーマ', ko: '매달 새로운 테마' },
    mbRewards: { en: 'Earn Paw Points', zh: '赚取爪印积分', es: 'Gana Paw Points', fr: 'Gagnez des Paw Points', ja: 'Paw Points獲得', ko: 'Paw Points 적립' },
    mbRewardsDesc: { en: 'Loyalty multipliers on every mystery box order', zh: '每笔盲盒订单享受积分倍增', es: 'Multiplicadores en cada pedido', fr: 'Multiplicateurs sur chaque commande', ja: '注文でポイント倍増', ko: '주문마다 포인트 배수' },
    noProductsFound: { en: 'No products found. Check back soon!', zh: '暂无产品，请稍后再来！', es: '¡No se encontraron productos!', fr: 'Aucun produit trouvé !', ja: '商品が見つかりません', ko: '상품을 찾을 수 없습니다' },
  },
  footer: {
    tagline: { en: 'Premium pet essentials with collectible drop energy.', zh: '精选宠物用品，限量发售的惊喜体验。', es: 'Productos premium para mascotas.', fr: "L'essentiel premium pour animaux.", ja: 'プレミアムペット用品。', ko: '프리미엄 반려동물 용품.' },
    shop: { en: 'Shop', zh: '商城', es: 'Tienda', fr: 'Boutique', ja: 'ショップ', ko: '쇼핑' },
    shopAll: { en: 'Shop all', zh: '全部商品', es: 'Ver todo', fr: 'Tout voir', ja: 'すべて見る', ko: '전체 보기' },
    shopByPet: { en: 'Shop by pet', zh: '按宠物分类', es: 'Por mascota', fr: 'Par animal', ja: 'ペットで探す', ko: '반려동물별' },
    shopByNeed: { en: 'Shop by need', zh: '按需求分类', es: 'Por necesidad', fr: 'Par besoin', ja: 'ニーズで探す', ko: '필요별' },
    help: { en: 'Help', zh: '帮助', es: 'Ayuda', fr: 'Aide', ja: 'ヘルプ', ko: '도움말' },
    faq: { en: 'FAQ', zh: '常见问题', es: 'Preguntas frecuentes', fr: 'FAQ', ja: 'よくある質問', ko: '자주 묻는 질문' },
    helpCenter: { en: 'Help Center', zh: '帮助中心', es: 'Centro de ayuda', fr: "Centre d'aide", ja: 'ヘルプセンター', ko: '고객센터' },
    trackOrder: { en: 'Track order', zh: '订单追踪', es: 'Rastrear pedido', fr: 'Suivre la commande', ja: '注文追跡', ko: '주문 추적' },
    returns: { en: 'Returns', zh: '退换货', es: 'Devoluciones', fr: 'Retours', ja: '返品', ko: '반품' },
    follow: { en: 'Follow', zh: '关注我们', es: 'Síguenos', fr: 'Suivez-nous', ja: 'フォロー', ko: '팔로우' },
    contact: { en: 'Contact', zh: '联系我们', es: 'Contacto', fr: 'Contact', ja: 'お問い合わせ', ko: '문의하기' },
  },
} as const

type Section = keyof typeof translations
type Key<S extends Section> = keyof (typeof translations)[S]
type TranslationEntry = Record<string, Record<string, string>>

/** Helper to get text from a bilingual/multilingual object, with en fallback */
export function txt(obj: Record<string, string>, locale: string): string {
  return obj[locale] || obj['en'] || ''
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: <S extends Section>(section: S, key: Key<S>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && ['en', 'zh', 'es', 'fr', 'ja', 'ko'].includes(saved)) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const t = useCallback(<S extends Section>(section: S, key: Key<S>): string => {
    const entry = (translations[section] as TranslationEntry)?.[key as string] as Record<string, string> | undefined
    if (!entry) return String(key)
    return entry[locale] || entry['en'] || String(key)
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
