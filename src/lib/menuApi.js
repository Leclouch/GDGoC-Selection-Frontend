// src/lib/menuApi.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api/menu';

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    // include raw text for debugging
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

export const menuApi = {
  getAllMenus: async () => {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error(`Failed to fetch menus: ${res.status}`);
    return parseJsonResponse(res);
  },

  searchMenus: async (query) => {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&page=1&per_page=20`);
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return parseJsonResponse(res);
  },

  groupByCategory: async (mode, per_category = 10) => {
    const res = await fetch(`${API_BASE}/group-by-category?mode=${encodeURIComponent(mode)}&per_category=${per_category}`);
    if (!res.ok) throw new Error(`Grouping failed: ${res.status}`);
    return parseJsonResponse(res);
  },

  createMenu: async (menuData) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.status}`);
    return parseJsonResponse(res);
  },

  updateMenu: async (id, menuData) => {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData),
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    return parseJsonResponse(res);
  },

  deleteMenu: async (id) => {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return parseJsonResponse(res);
  },

  // SAFE AI generation: call your backend endpoint that runs Gemini server-side
  generateMenuWithAI: async (category) => {
    const url = `${API_BASE}/generate-ai`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    if (!res.ok) {
      // try to parse JSON error, otherwise throw generic
      try {
        const errJson = await res.json();
        throw new Error(errJson.message || JSON.stringify(errJson));
      } catch {
        throw new Error(`AI generation failed: ${res.status}`);
      }
    }
    return res.json(); // expecting { message: "...", data: { ... } } or { data: { ... } }
  }
};
