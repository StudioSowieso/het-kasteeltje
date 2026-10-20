# Het Kasteeltje

Huishoud-webapp voor het huis "Het Kasteeltje": agenda en lijst met huishoudelijke taken, afvinken met wie het deed, en per taak een instelbaar terugkerend ritme (of eenmalig).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Motion · date-fns · Supabase · Vercel

## Pagina's

- `/` Agenda (maandraster) en lijstweergave, taken afvinken en kiezen wie ze deed
- `/taken` Categorieën en taken beheren, terugkerende periode instellen, eenmalige taken inplannen
- `/huisgenoten` Huisgenoten beheren

## Toegang

De app gebruikt één gedeelde huiscode. Die gaat als header (`x-household-code`) mee naar Supabase en wordt server-side gecontroleerd door Row Level Security (functie `kt_has_access`). De hash van de code staat in tabel `kt_settings`.

Code wijzigen (voer uit in Supabase SQL editor):

```sql
update public.kt_settings
set code_hash = encode(extensions.digest(convert_to('nieuwe-code', 'utf8'), 'sha256'), 'hex')
where id = 1;
```

## Lokaal draaien

```bash
cp .env.example .env.local   # vul URL en publishable/anon key in
npm install
npm run dev
```

## Database

Tabellen (prefix `kt_`): `kt_settings`, `kt_members`, `kt_categories`, `kt_tasks`, `kt_completions`. Alle tabellen hebben RLS aan.
