import { useEffect, useState } from 'react';
import { getPage, getServices, mediaUrl } from './api.js';

const routes = {
  '/': { slug: 'home', label: 'Start' },
  '/om': { slug: 'about', label: 'Om' },
  '/tjanster': { slug: 'services', label: 'Tjänster' },
};

const normalizePath = (path) => {
  if (!path || path === '/') {
    return '/';
  }

  return path.replace(/\/+$/, '');
};

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

const PageMedia = ({ page }) => (
  <div className="page-image">
    <SectionImage image={page.heroImage} alt={page.heading} />
  </div>
);

const PageCopy = ({ page, eyebrow }) => (
  <div className="page-copy">
    <span className="eyebrow">{eyebrow}</span>
    <h1>{page.heading}</h1>
    <p className="intro">{page.introText}</p>
    <div className="body-copy">{renderText(page.bodyText)}</div>
  </div>
);

const NavLink = ({ href, children, currentPath, onNavigate, className }) => (
  <a
    aria-current={currentPath === href ? 'page' : undefined}
    className={className}
    href={href}
    onClick={(event) => onNavigate(event, href)}
  >
    {children}
  </a>
);

const Header = ({ currentPath, onNavigate }) => (
  <header className="topbar">
    <NavLink
      className="brand"
      currentPath={currentPath}
      href="/"
      onNavigate={onNavigate}
    >
      Lokalverk
    </NavLink>
    <nav aria-label="Huvudnavigation">
      {Object.entries(routes).map(([href, route]) => (
        <NavLink
          currentPath={currentPath}
          href={href}
          key={href}
          onNavigate={onNavigate}
        >
          {route.label}
        </NavLink>
      ))}
    </nav>
  </header>
);

const Footer = () => (
  <footer className="footer">
    <div>
      <strong>Lokalverk Snickeri</strong>
      <p>Nyköping, Sverige</p>
    </div>
    <div>
      <a href="mailto:hej@lokalverk.test">hej@lokalverk.test</a>
      <a href="tel:+46155420000">0155-42 00 00</a>
    </div>
  </footer>
);

const HomePage = ({ page, currentPath, onNavigate }) => (
  <section className="hero">
    <PageCopy page={page} eyebrow="Snickeri i Nyköping" />
    <div>
      <PageMedia page={page} />
      <NavLink
        className="button hero-action"
        currentPath={currentPath}
        href="/tjanster"
        onNavigate={onNavigate}
      >
        {page.buttonText || 'Se våra tjänster'}
      </NavLink>
    </div>
  </section>
);

const AboutPage = ({ page }) => (
  <section className="page-section">
    <PageMedia page={page} />
    <PageCopy page={page} eyebrow={page.pageName} />
  </section>
);

const ServicesPage = ({ page, services }) => (
  <section className="services-section">
    <div className="services-intro">
      <PageCopy page={page} eyebrow={page.pageName} />
      <PageMedia page={page} />
    </div>
    <div className="service-grid">
      {services.map((service) => (
        <article className="service-card" key={service.id}>
          <SectionImage image={service.coverImage} alt={service.serviceName} />
          <div className="service-card-copy">
            <h2>{service.serviceName}</h2>
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
);

function App() {
  const [currentPath, setCurrentPath] = useState(() =>
    normalizePath(window.location.pathname)
  );
  const [page, setPage] = useState(null);
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const route = routes[currentPath];

    if (!route) {
      setPage(null);
      setServices([]);
      setStatus('not-found');
      return;
    }

    let isActive = true;

    const load = async () => {
      setStatus('loading');
      setError('');

      try {
        const [nextPage, nextServices] = await Promise.all([
          getPage(route.slug),
          route.slug === 'services' ? getServices() : Promise.resolve([]),
        ]);

        if (!isActive) {
          return;
        }

        if (!nextPage) {
          setPage(null);
          setServices([]);
          setStatus('not-found');
          return;
        }

        setPage(nextPage);
        setServices(nextServices);
        setStatus('ready');
      } catch (err) {
        if (!isActive) {
          return;
        }

        setError(err.message);
        setStatus('error');
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [currentPath]);

  useEffect(() => {
    if (page?.heading) {
      document.title = `${page.heading} | Lokalverk Snickeri`;
    }
  }, [page]);

  const handleNavigate = (event, href) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    const nextPath = normalizePath(href);

    if (nextPath !== currentPath) {
      window.history.pushState({}, '', href);
      setCurrentPath(nextPath);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

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

  if (status === 'not-found') {
    return (
      <div className="site-shell">
        <Header currentPath={currentPath} onNavigate={handleNavigate} />
        <main className="state-screen">
          <p>Sidan finns inte.</p>
          <NavLink
            className="button"
            currentPath={currentPath}
            href="/"
            onNavigate={handleNavigate}
          >
            Till startsidan
          </NavLink>
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <Header currentPath={currentPath} onNavigate={handleNavigate} />
      <main>
        {currentPath === '/' && (
          <HomePage
            currentPath={currentPath}
            onNavigate={handleNavigate}
            page={page}
          />
        )}
        {currentPath === '/om' && <AboutPage page={page} />}
        {currentPath === '/tjanster' && (
          <ServicesPage page={page} services={services} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
