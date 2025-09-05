# Verifica Copertura Fibra – Sito pronto

Questo progetto Next.js pubblica una pagina `/coverage` per verificare la copertura (mock).

## Come usare (semplice)

1. **Scarica** lo zip e scompattalo.
2. Apri una shell nella cartella e installa le dipendenze:
   ```bash
   npm install
   npm run dev
   ```
   Apri `http://localhost:3000/coverage` per provare.

## Mettere online con Vercel (consigliato)

1. Crea un account su **Vercel** e accedi.
2. Crea un nuovo progetto importando questa cartella da GitHub **oppure** usa il pulsante "New Project" e seleziona **Next.js**.
3. Alla fine della build avrai un URL del tipo `https://tuo-progetto.vercel.app`.
4. **Collega il tuo dominio**: su Vercel vai in *Settings → Domains*, inserisci il dominio e segui le istruzioni DNS mostrate (il pannello ti dirà esattamente che record aggiungere).

> Suggerimento: per il dominio principale (apex) ti potrebbe chiedere un record **A** o **ALIAS**; per un sottodominio un record **CNAME**. Segui sempre i record mostrati da Vercel.

## Struttura

- `app/coverage/page.tsx` – pagina con form e risultati
- `app/api/coverage/route.ts` – API (mock) che restituisce lo stato copertura
- `app/page.tsx` – homepage semplice con link
- `app/layout.tsx` – layout base
- `styles/globals.css` – stile (Tailwind + custom)

## Passare a dati reali

Sostituisci il mock in `app/api/coverage/route.ts` con chiamate verso i tuoi fornitori (Open Fiber, FiberCop/TIM, Fastweb, ...). Normalizza i dati nel formato già usato dal frontend.

## Requisiti

- Node.js 18+
- npm 9+

Buon lavoro! 🚀
