# Reflektion – Inlämningsuppgift 2

## Kund och domän

Kunden är Lokalverk Snickeri, ett fiktivt litet snickeriföretag i Nyköping. Verksamheten arbetar med platsbyggd förvaring, inredningsdetaljer och enklare utemiljöer i trä. Kunden behöver en enkel webbplats där de själva kan ändra texter, bilder och tjänster utan att be en utvecklare ändra koden.

## Lösningens arkitektur

Lösningen består av tre huvuddelar: miljön i Docker Compose, CMS:et i Strapi och frontenden i React. Docker Compose startar PostgreSQL, Strapi, React/Vite och Nginx. PostgreSQL sparar allt CMS-innehåll, Strapi tillhandahåller adminpanel och REST API, och React-frontenden visar innehållet för besökaren.

Nginx är den enda publika ingången. Vanlig webbtrafik går till frontenden, medan API-anrop, mediafiler och Strapis adminpanel skickas vidare till Strapi. När en besökare öppnar webbplatsen hämtar React innehåll från Strapis REST API med query-parametrar för filtrering, sortering och media-populering. Strapi läser innehållet från PostgreSQL och skickar tillbaka JSON som frontenden renderar.

## Innehållsmodellen

Jag modellerade webbplatsens huvudsidor som innehållstypen Page. Varje sida har fält för sidnamn, slug, rubrik, ingress, brödtext, knapptext, sorteringsordning och hero-bild. Det gör att kunden kan redigera Home, About och Services på ett sätt som liknar hur de tänker på sin webbplats, snarare än hur koden är byggd.

Jag lade också till innehållstypen Service för företagets specifika tjänster. Den har fält för tjänstens namn, kort beskrivning, längre beskrivning, pris från, bild och sorteringsordning. Den modellen passar snickeriet eftersom tjänsterna är återkommande innehåll som kan listas, sorteras och återanvändas på flera platser.

## Innehållsdistribution

Samma innehåll kan distribueras till minst två plattformar, till exempel webbplatsen och en mobilapp. En annan möjlighet är att använda samma tjänsteinformation på webbplatsen och på en digital skärm i kundens verkstad eller butik.

Headless-arkitekturen gör detta möjligt eftersom innehållet inte är bundet till ett visst tema eller en viss sidmall i CMS:et. Strapi levererar innehåll som strukturerad data via API, och olika klienter kan själva bestämma hur datan ska presenteras. I ett traditionellt CMS är innehåll och presentation ofta mer sammanflätade, vilket gör det svårare att återanvända samma innehåll i flera kanaler.
