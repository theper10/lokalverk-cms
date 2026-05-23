# Lokalverk Snickeri – Headless CMS

Det här är ett komplett Docker-projekt för inlämningsuppgiften **Headless CMS – website for a local business**. Projektet använder Strapi som headless CMS, PostgreSQL som databas, React + Vite som frontend och Nginx som enda publika ingång.

## Kund och verksamhet

Den fiktiva kunden är **Lokalverk Snickeri**, ett litet snickeri i Nyköping som bygger platsbyggd förvaring, inredningsdetaljer och enklare utemiljöer i trä. Kunden behöver kunna ändra sidtexter, bilder och tjänster utan att ändra kod.

## Starta projektet

Kör från projektets rot:

```bash
docker compose up --build
```

Första starten bygger containrarna, startar PostgreSQL, bygger Strapis adminpanel, skapar demo-innehåll och startar webbplatsen via Nginx.

## URL:er

- Startsida: [http://localhost:8080](http://localhost:8080)
- Om-sida: [http://localhost:8080/om](http://localhost:8080/om)
- Tjänster-sida: [http://localhost:8080/tjanster](http://localhost:8080/tjanster)
- Strapi admin: [http://localhost:8080/admin](http://localhost:8080/admin)
- Strapi REST API via Nginx: [http://localhost:8080/api](http://localhost:8080/api)
- Uppladdade mediafiler: [http://localhost:8080/uploads](http://localhost:8080/uploads)

Nginx är den enda tjänsten som exponeras mot datorn. PostgreSQL, Strapi och frontend är endast tillgängliga internt i Docker-nätverket.

## Strapi-inloggning

Ett testkonto skapas automatiskt första gången CMS:et startar:

- E-post: `admin@lokalverk.test`
- Lösenord: `Admin123!`

Uppgifterna kan ändras med variablerna `ADMIN_EMAIL` och `ADMIN_PASSWORD`. För en riktig miljö ska även alla Strapi-hemligheter i `.env.example` bytas ut.

## Redigera innehåll

1. Gå till [http://localhost:8080/admin](http://localhost:8080/admin).
2. Logga in med testkontot.
3. Öppna **Content Manager**.
4. Redigera poster under **Page** för sidorna Home, About och Services.
5. Redigera poster under **Service** för företagets tjänster.
6. Spara. Webbplatsen hämtar innehåll från Strapis REST API och visar ändringarna vid omladdning.

Webbplatsens navigation använder riktiga sidvägar: `/`, `/om` och `/tjanster`. Sidorna kan öppnas direkt eller laddas om i webbläsaren eftersom Nginx skickar klientrutter till React-frontenden.

Varje sida har redigerbara fält för namn, slug, rubrik, ingress, brödtext, knapptext, sorteringsordning och bild. Tjänsterna har namn, kort beskrivning, längre beskrivning, pris, sorteringsordning och bild.

## Projektstruktur

```text
/cms                 Strapi CMS, innehållsmodeller, seed och Dockerfile
/client              React + Vite frontend och Dockerfile
nginx.conf           Reverse proxy för webbplats, API, media och adminpanel
docker-compose.yml   Startar PostgreSQL, Strapi, frontend och Nginx
.env.example         Exempel på alla miljövariabler utan riktiga hemligheter
README.md            Startinstruktioner och kunddokumentation
REFLEKTION.md        Reflektion enligt uppgiftens svenska struktur
```

## Felsökning

- Om port `8080` är upptagen kan du sätta `PUBLIC_PORT` i en lokal `.env`, till exempel `PUBLIC_PORT=8090`.
- Om du vill börja om med helt tom databas och ny seedning kan du köra `docker compose down -v` och sedan `docker compose up --build`.
- Om adminpanelen inte är klar direkt, vänta en stund och ladda om. Strapi bygger och startar långsammare första gången.
