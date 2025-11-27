import { GoogleGenerativeAI } from "@google/generative-ai";
// import GEMINI_API_KEY from '.env.local';
// asdasdasdasd
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api/menu';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const menuApi = {
  getAllMenus: async () => {
    const res = await fetch(API_BASE);
    return res.json();
  },

  searchMenus: async (query) => {
    const res = await fetch(`${API_BASE}/search?q=${query}&page=1&per_page=20`);
    return res.json();
  },

  groupByCategory: async (mode) => {
    const res = await fetch(`${API_BASE}/group-by-category?mode=${mode}`);
    return res.json();
  },

  createMenu: async (menuData) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData),
    });
    return res.json();
  },

  updateMenu: async (id, menuData) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData),
    });
    return res.json();
  },

  deleteMenu: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return res.json();
  },

  generateMenuWithAI: async (category) => {
    const prompt = `Generate a single restaurant menu item in this category: "${category}". 
    Return ONLY a valid JSON object (no markdown, no extra text) with this exact format:
    {
      "name": "dish name",
      "category": "${category}",
      "calories": number between 100-800,
      "price": number between 5000-50000,
      "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
      "description": "short description"
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response from AI');
    
    return JSON.parse(jsonMatch[0]);
  }
};

