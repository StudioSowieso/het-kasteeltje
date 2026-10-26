# Het Kasteeltje

Huishoud-webapp voor het huis "Het Kasteeltje": agenda en lijst met huishoudelijke taken, afvinken met wie het deed, en per taak een instelbaar terugkerend ritme (of eenmalig).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Motion · date-fns · Supabase · Vercel

## Pagina's

- `/` Agenda (maandraster) en lijstweergave, taken afvinken en kiezen wie ze deed
- `/taken` Categorieën en taken beheren, terugkerende periode instellen, eenmalige taken inplannen
- `/huisgenoten` Huisgenoten beheren

## Toegang

Er is geen login of huiscode: iedereen met de link kan de app gebruiken en wijzigen. De tabellen hebben Row Level Security aan, maar `kt_has_access()` geeft `true` terug. Wil je weer afschermen, pas die functie dan aan.

## Lokaal draaien

```bash
cp .env.example .env.local   # vul URL en publishable/anon key in
npm install
npm run dev
```

## Database

Tabellen (prefix `kt_`): `kt_settings`, `kt_members`, `kt_categories`, `kt_tasks`, `kt_completions`. Alle tabellen hebben RLS aan.

## Android-widget (KWGT)

`/api/widget` geeft de openstaande taken van vandaag (plus achterstallige van de afgelopen 7 dagen):

- `/api/widget` geeft JSON met `summary`, `open`, `text` en `items`
- `/api/widget?format=text` geeft platte tekst, één taak per regel

In KWGT: voeg een widget toe, plaats een Tekst-item en gebruik als formule
`$wg("https://het-kasteeltje.vercel.app/api/widget", json, text)$`
(voor het aantal: `.open`, voor de samenvatting: `.summary`).

## Android-widget (eigen app)

De map `android/` bevat een kleine Android-app met een beginschermwidget in dezelfde stijl als de webapp. GitHub Actions bouwt hem bij elke wijziging in `android/` en zet de APK op de release `widget-latest`. Installeren: download `het-kasteeltje-widget.apk` op je telefoon, sta installatie uit onbekende bronnen toe, en voeg daarna de widget "Taken van vandaag" toe vanuit je widgetkiezer.
