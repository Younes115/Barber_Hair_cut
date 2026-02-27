# استخدام بيئة Node.js خفيفة وسريعة
FROM node:18-alpine

# تحديد مسار العمل جوه السيرفر
WORKDIR /app

# نسخ ملفات الحزم الخاصة بالباك إند أولاً
COPY backend/package*.json ./backend/

# الدخول لفولدر الباك إند وتسطيب المكتبات
RUN cd backend && npm install

# نسخ باقي ملفات المشروع (الباك إند والفرونت إند)
COPY . .

# السماح بفتح البورت 5000
EXPOSE 5000

# الأمر اللي هيشغل السيرفر
CMD ["node", "backend/server.js"]