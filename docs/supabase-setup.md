# Настройка Supabase для отзывов

1. Зарегистрируйтесь на [supabase.com](https://supabase.com), создайте проект.
2. В **SQL Editor** выполните:

```sql
-- Таблица отзывов
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  text text not null,
  created_at timestamptz default now()
);

-- RLS: все могут читать, все могут добавлять (анонимно)
alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Anyone can insert review"
  on public.reviews for insert
  with check (true);
```

3. В **Project Settings → API** скопируйте **Project URL** и **anon public** key.
4. В корне проекта создайте файл `.env.local` (не коммитить):

```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

5. Перезапустите `npm start`. Отзывы будут загружаться из Supabase. Если ключи не заданы, приложение покажет статические отзывы из `src/data/reviews.json`.

## Начальные данные (опционально)

Чтобы перенести текущие 10 отзывов из приложения в Supabase, в **SQL Editor** можно выполнить (даты будут как в приложении):

```sql
insert into public.reviews (name, rating, text, created_at) values
  ('А. Петров', 5, 'Быстро, качественно, всё чётко.', '2025-04-12'::date),
  ('Е. Соколова', 5, 'Очень приятный сервис. Номер получила за два дня, как и обещали.', '2025-04-08'::date),
  ('И. Козлов', 5, 'Рекомендую! Честные цены, без скрытых комиссий.', '2025-04-05'::date),
  ('М. Новикова', 5, 'Долго искала красивый номер — здесь нашла идеальный вариант.', '2025-04-01'::date),
  ('Д. Волков', 5, 'Всё прозрачно, документы оформили быстро. Спасибо!', '2025-03-28'::date),
  ('О. Морозова', 5, 'Первый раз покупала номер — консультант всё объяснил по шагам.', '2025-03-24'::date),
  ('С. Лебедев', 5, 'Качество на высоте. Буду рекомендовать знакомым.', '2025-03-20'::date),
  ('Н. Кузнецова', 5, 'Удобно, быстро, приятные цены. Очень довольна.', '2025-03-15'::date),
  ('В. Попов', 5, 'Профессиональный подход. Всё как надо.', '2025-03-10'::date),
  ('Т. Федорова', 5, 'Отличный сервис! Номер мечты наконец у меня.', '2025-03-05'::date);
```

## Деплой (GitHub Pages)

В **GitHub repo → Settings → Secrets and variables → Actions** добавьте секреты:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

В workflow деплоя передайте их в `env` при сборке (`npm run build`). В Supabase **Authentication → URL Configuration** при необходимости добавьте домен сайта в разрешённые (для CORS anon key обычно уже разрешён).
