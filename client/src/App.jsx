import { useEffect, useMemo, useState } from 'react';
import { getPage, getPages, getServices, mediaUrl } from './api.js';

const renderText = (text) =>
  String(text || '')
    .split('\n')
    .filter(Boolean)
    .map((paragraph) => <p key={paragraph}>{paragraph}</p>);

const SectionImage = ({ image, alt }) => {
  const src = mediaUrl(image);

  if (!src) {
    return null;
  }

  return <img src={src} alt={alt} loading="lazy" />;
};

function App() {
  const [content, setContent] = useState({
    home: null,
    pages: [],
    services: [],
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [home, pages, services] = await Promise.all([
          getPage('home'),
          getPages(),
          getServices(),
        ]);

        setContent({ home, pages, services });
        setStatus('ready');
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    };

    load();
  }, []);

  const about = useMemo(
    () => content.pages.find((page) => page.slug === 'about'),
    [content.pages]
  );
  const servicesPage = useMemo(
    () => content.pages.find((page) => page.slug === 'services'),
    [content.pages]
  );

  if (status === 'loading') {
    return (
      <main className="state-screen">
        <p>Laddar innehåll...</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="state-screen">
        <p>Kunde inte hämta innehåll från CMS.</p>
        <small>{error}</small>
      </main>
    );
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#start" aria-label="Lokalverk Snickeri">
          Lokalverk
        </a>
        <nav aria-label="Huvudnavigation">
          <a href="#om">Om</a>
          <a href="#tjanster">Tjänster</a>
          <a href="#kontakt">Kontakt</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="start">
          <div className="hero-copy">
            <span className="eyebrow">Snickeri i Nyköping</span>
            <h1>{content.home?.heading}</h1>
            <p className="intro">{content.home?.introText}</p>
            <div className="body-copy">{renderText(content.home?.bodyText)}</div>
            <a className="button" href="#tjanster">
              {content.home?.buttonText}
            </a>
          </div>
          <div className="hero-image">
            <SectionImage
              image={content.home?.heroImage}
              alt={content.home?.heading || 'Snickeriverkstad'}
            />
          </div>
        </section>

        {about && (
          <section className="split-section" id="om">
            <div className="section-image">
              <SectionImage image={about.heroImage} alt={about.heading} />
            </div>
            <div className="section-copy">
              <span className="section-label">{about.pageName}</span>
              <h2>{about.heading}</h2>
              <p className="intro">{about.introText}</p>
              <div className="body-copy">{renderText(about.bodyText)}</div>
            </div>
          </section>
        )}

        {servicesPage && (
          <section className="services-section" id="tjanster">
            <div className="section-heading">
              <span className="section-label">{servicesPage.pageName}</span>
              <h2>{servicesPage.heading}</h2>
              <p>{servicesPage.introText}</p>
            </div>
            <div className="service-grid">
              {content.services.map((service) => (
                <article className="service-card" key={service.id}>
                  <SectionImage
                    image={service.coverImage}
                    alt={service.serviceName}
                  />
                  <div className="service-card-copy">
                    <h3>{service.serviceName}</h3>
                    <p>{service.shortDescription}</p>
                    <div className="body-copy">
                      {renderText(service.detailedDescription)}
                    </div>
                    <strong>{service.priceFrom}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="footer" id="kontakt">
        <div>
          <strong>Lokalverk Snickeri</strong>
          <p>Nyköping, Sverige</p>
        </div>
        <div>
          <a href="mailto:hej@lokalverk.test">hej@lokalverk.test</a>
          <a href="tel:+46155420000">0155-42 00 00</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
