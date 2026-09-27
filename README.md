# Personal Dashboard — Mohamed Ahmed

نظام Login خاص بشخص واحد (Admin) + Dashboard لإدارة المصروفات الشخصية والاشتراكات الشهرية،
مدموج مع صفحة البورتفوليو الأصلية في مشروع Frontend واحد.

## هيكل المشروع

```
project/
├── backend/                 ← Node.js + Express + MongoDB (API)
└── frontend/                ← مشروع React/Vite واحد يحتوي على:
    ├── index.html           ← البورتفوليو (نفس التصميم الأصلي 100%، زرار Login مضاف فوق)
    ├── app/index.html       ← نقطة دخول الـ React App (Login + Dashboard)
    └── src/                 ← كود الـ Login والـ Dashboard (React)
```

- زيارة `/` → البورتفوليو الأصلي (ستاتيك، زي ما هو تمامًا).
- زيارة `/app/login` → صفحة تسجيل الدخول.
- زيارة `/app/dashboard` → الداشبورد (محمية، لازم تسجل دخول الأول).
- في أعلى صفحة البورتفوليو، جنب زرار الوضع الليلي/النهاري، فيه أيقونة 🔐 بتودّيك مباشرة لصفحة الـ Login.

> **ملاحظة**: الملف اللي رفعته أصلًا (`Profile-main.zip`) كان صفحة بورتفوليو ستاتيك بس (بدون React/Node/MongoDB).
> بناءً على تأكيدك، تم بناء `backend` بالكامل من الصفر، ودمج البورتفوليو جوه مشروع `frontend`
> واحد موحّد بنفس هويته البصرية (الألوان، الخطوط، الـ glassmorphism).

---

## 1) تشغيل الـ Backend

```bash
cd backend
npm install
cp .env.example .env
```

افتح `.env` وعدّل:

| المتغير | الوصف |
|---|---|
| `MONGODB_URI` | رابط قاعدة بيانات MongoDB (محلي أو Atlas) |
| `JWT_SECRET` | نص عشوائي طويل وسري |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | بيانات الحساب الوحيد اللي هتسجل دخول بيه (اختارهم إنت بنفسك) |
| `CLIENT_URL` | رابط الفرونتاند (افتراضيًا `http://localhost:5173`) |

أنشئ حسابك مرة واحدة فقط:

```bash
npm run seed
```

شغّل السيرفر:

```bash
npm run dev
```

السيرفر هيشتغل على `http://localhost:5000`

---

## 2) تشغيل الـ Frontend

```bash
cd frontend
npm install
npm run dev
```

هيفتح على `http://localhost:5173`:
- `http://localhost:5173/` → البورتفوليو.
- `http://localhost:5173/app/login` → تسجيل الدخول (أو دوس على أيقونة 🔐 فوق في البورتفوليو).

---

## 3) البناء للنشر (Production)

```bash
cd frontend
npm run build
```

هينتج فولدر `dist/` فيه المشروعين مع بعض (البورتفوليو + الـ Dashboard). لازم تضيف Rewrite Rule
على السيرفر بتاعك عشان الروابط العميقة زي `/app/dashboard/expenses` تشتغل صح بعد الـ refresh:

- **Netlify**: ملف `public/_redirects` موجود بالفعل وبينسخ تلقائيًا لـ `dist/`.
- **Vercel**: ضيف في `vercel.json`:
  ```json
  { "rewrites": [{ "source": "/app/:path*", "destination": "/app/index.html" }] }
  ```
- **Nginx/Apache**: أي طلب يبدأ بـ `/app/` ومالوش امتداد ملف (مش `.js`/`.css`/...) لازم يترجع `app/index.html`.

وعدّل `VITE_API_URL` (frontend `.env`) على رابط الـ backend المنشور، و`CLIENT_URL` (backend `.env`)
على رابط الفرونتاند المنشور. في production لازم HTTPS عشان الكوكي (`secure: true`) يشتغل صح.

---

## المميزات المنفذة

- **Login** بحساب واحد فقط (لا يوجد Register)، بـ JWT في httpOnly cookie، وخيار "تذكرني".
- **Protected routes**: أي محاولة فتح `/app/dashboard` من غير تسجيل دخول → تحويل لـ `/app/login` تلقائيًا،
  ونفس الحماية على مستوى الـ API.
- **Dashboard Home**: بطاقات Dynamic (مصروفات الشهر / المشتركين / الإيراد المتوقع / Net Difference) +
  آخر 5 مصروفات + آخر 5 مدفوعات + Month Picker.
- **مصروفاتي**: جدول Responsive (يتحول لكروت على الموبايل)، إضافة/تعديل/حذف، فلترة بالشهر.
- **الاشتراكات**: جدول المشتركين (🟢 Paid / 🔴 Unpaid / 🟡 Due Soon)، Drawer لتفاصيل كل مشترك
  فيه Payment History كامل وزرار "Mark as Paid".
- **Dark/Light Mode**, Toast notifications, Empty states, Loading states, انيميشنز خفيفة.
- **الأمان**: bcrypt، JWT في httpOnly cookie، كل الـ Models مرتبطة بـ `userId`، Validation على الـ inputs.

## ملاحظة عن "Due Soon"

الحالة بتتحسب: لو المشترك مدفوعله الشهر الحالي → **Paid**. لو لسه ماوصلش يوم اشتراكه (يوم انضمامه)
في الشهر الحالي → **Due Soon**. لو عدّى اليوم ده من غير دفع → **Unpaid**. المنطق موجود في
`backend/routes/subscribers.js` (function `computeStatus`).
