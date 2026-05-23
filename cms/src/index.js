'use strict';

const fs = require('fs');
const path = require('path');

const pages = [
  {
    pageName: 'Home',
    slug: 'home',
    heading: 'Lokalverk Snickeri',
    introText:
      'Platsbyggda lösningar, reparationer och finsnickeri för hem och småföretag i Nyköping.',
    bodyText:
      'Vi bygger bokhyllor, garderober, kökssnickerier och smart förvaring med fokus på hållbara material och personlig service.\n\nSom lokal snickeripartner tar vi små och medelstora uppdrag från första skiss till färdigt montage.',
    buttonText: 'Se våra tjänster',
    sortOrder: 1,
    image: 'home-workshop.svg',
  },
  {
    pageName: 'About',
    slug: 'about',
    heading: 'Ett litet snickeri med nära kundkontakt',
    introText:
      'Lokalverk drivs av två snickare som kombinerar traditionellt hantverk med tydlig planering.',
    bodyText:
      'Kunden möter samma personer genom hela projektet. Det gör besluten enklare, tidsplanen tydligare och slutresultatet mer personligt.\n\nVi arbetar främst med massivt trä, faner och återbrukade detaljer när det passar projektet.',
    buttonText: 'Kontakta oss',
    sortOrder: 2,
    image: 'about-team.svg',
  },
  {
    pageName: 'Services',
    slug: 'services',
    heading: 'Tjänster för hem, butik och kontor',
    introText:
      'Våra vanligaste uppdrag är platsbyggd förvaring, inredningssnickeri och renovering av befintliga trädetaljer.',
    bodyText:
      'Varje uppdrag börjar med ett kort behovsmöte. Därefter får kunden en enkel offert med materialval, tidplan och vad som ingår.\n\nNedan visas exempel på tjänster som kunden själv kan uppdatera i CMS:et.',
    buttonText: 'Boka kostnadsfri genomgång',
    sortOrder: 3,
    image: 'services-cabinet.svg',
  },
];

const services = [
  {
    serviceName: 'Platsbyggd förvaring',
    shortDescription:
      'Skräddarsydda garderober, bokhyllor och hallösningar som utnyttjar rummets mått.',
    detailedDescription:
      'Vi mäter upp platsen, tar fram ett enkelt förslag och bygger lösningen i verkstaden innan montering hemma hos kunden.',
    priceFrom: 'Från 8 500 kr',
    sortOrder: 1,
    image: 'services-cabinet.svg',
  },
  {
    serviceName: 'Köks- och inredningsdetaljer',
    shortDescription:
      'Bänkskivor, fronter, öppna hyllor och specialdelar som gör befintlig inredning mer personlig.',
    detailedDescription:
      'Passar kunder som vill förbättra ett kök eller kontor utan att byta ut allt. Vi hjälper till med materialval och finish.',
    priceFrom: 'Från 4 900 kr',
    sortOrder: 2,
    image: 'home-workshop.svg',
  },
  {
    serviceName: 'Utemiljö i trä',
    shortDescription:
      'Trappor, odlingslådor, enklare altandetaljer och reparationer för gård och uteplats.',
    detailedDescription:
      'Vi bygger praktiska lösningar för nordiskt väder och väljer material som är lätta att underhålla över tid.',
    priceFrom: 'Från 6 000 kr',
    sortOrder: 3,
    image: 'outdoor-deck.svg',
  },
];

const findFirst = async (uid, filters) => {
  const results = await strapi.entityService.findMany(uid, {
    filters,
    limit: 1,
  });

  return results[0];
};

const uploadImageIfNeeded = async (fileName, alternativeText) => {
  const existing = await strapi.entityService.findMany('plugin::upload.file', {
    filters: { name: fileName },
    limit: 1,
  });

  if (existing.length > 0) {
    return existing[0].id;
  }

  const filePath = path.join(__dirname, '..', 'seed', 'assets', fileName);
  const stats = fs.statSync(filePath);
  const uploaded = await strapi.plugin('upload').service('upload').upload({
    data: {
      fileInfo: {
        name: fileName,
        alternativeText,
        caption: 'Demo image seeded automatically for the assignment.',
      },
    },
    files: {
      path: filePath,
      name: fileName,
      type: 'image/svg+xml',
      size: stats.size,
    },
  });

  return uploaded[0].id;
};

const ensurePublicPermissions = async () => {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  const actions = [
    'api::page.page.find',
    'api::page.page.findOne',
    'api::service.service.find',
    'api::service.service.findOne',
    'plugin::upload.content-api.find',
    'plugin::upload.content-api.findOne',
  ];

  for (const action of actions) {
    const existing = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });

    if (!existing) {
      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action,
          role: publicRole.id,
        },
      });
    }
  }
};

const ensureAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@lokalverk.test';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existing = await strapi
    .query('admin::user')
    .findOne({ where: { email } });

  if (existing) {
    return;
  }

  const superAdminRole = await strapi
    .query('admin::role')
    .findOne({ where: { code: 'strapi-super-admin' } });

  const hashedPassword = await strapi.service('admin::auth').hashPassword(password);

  await strapi.query('admin::user').create({
    data: {
      firstname: 'Demo',
      lastname: 'Admin',
      email,
      password: hashedPassword,
      isActive: true,
      blocked: false,
      preferedLanguage: 'sv',
      roles: [superAdminRole.id],
    },
  });
};

const seedPages = async () => {
  for (const page of pages) {
    const existing = await findFirst('api::page.page', { slug: page.slug });

    if (existing) {
      continue;
    }

    const mediaId = await uploadImageIfNeeded(
      page.image,
      `Illustration for the ${page.pageName} page`
    );

    const { image, ...data } = page;

    await strapi.entityService.create('api::page.page', {
      data: {
        ...data,
        heroImage: mediaId,
      },
    });
  }
};

const seedServices = async () => {
  for (const service of services) {
    const existing = await findFirst('api::service.service', {
      serviceName: service.serviceName,
    });

    if (existing) {
      continue;
    }

    const mediaId = await uploadImageIfNeeded(
      service.image,
      `Illustration for ${service.serviceName}`
    );

    const { image, ...data } = service;

    await strapi.entityService.create('api::service.service', {
      data: {
        ...data,
        coverImage: mediaId,
      },
    });
  }
};

module.exports = {
  register() {},

  async bootstrap() {
    await ensureAdminUser();
    await ensurePublicPermissions();
    await seedPages();
    await seedServices();
  },
};
