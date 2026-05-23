const API_BASE = import.meta.env.VITE_STRAPI_BASE_URL || '/api';
const ASSET_BASE = import.meta.env.VITE_STRAPI_ASSET_BASE_URL || '';

const unwrap = (entity) => ({
  id: entity.id,
  ...entity.attributes,
});

const request = async (path) => {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Strapi returned ${response.status} for ${path}`);
  }

  const payload = await response.json();
  return payload.data;
};

export const getPage = async (slug) => {
  const params = new URLSearchParams();
  params.append('filters[slug][$eq]', slug);
  params.append('populate', 'heroImage');

  const data = await request(`/pages?${params.toString()}`);
  return data.length > 0 ? unwrap(data[0]) : null;
};

export const getServices = async () => {
  const params = new URLSearchParams();
  params.append('populate', 'coverImage');
  params.append('sort', 'sortOrder:asc');
  params.append('pagination[pageSize]', '6');

  const data = await request(`/services?${params.toString()}`);
  return data.map(unwrap);
};

export const mediaUrl = (media) => {
  const url =
    media?.data?.attributes?.url ||
    media?.attributes?.url ||
    media?.url ||
    '';

  if (!url || url.startsWith('http')) {
    return url;
  }

  return `${ASSET_BASE}${url}`;
};
