'use client';
// frontend/src/app/page.js
import { useState, useEffect } from 'react';
import { menuApi } from '@/lib/menuApi';

export default function Home() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [grouped, setGrouped] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    calories: '',
    price: '',
    ingredients: '',
    description: '',
  });

  const fetchAllMenus = async () => {
    setLoading(true);
    try {
      const json = await menuApi.getAllMenus();
      setMenus(json.data);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const json = await menuApi.searchMenus(searchQuery);
      setMenus(json.data);
      setView('search');
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleGrouped = async (mode) => {
    setLoading(true);
    try {
      const json = await menuApi.groupByCategory(mode);
      setGrouped(json.data);
      setView('grouped');
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.calories || !formData.price || !formData.ingredients || !formData.description) {
      alert('All fields required');
      return;
    }

    const payload = {
      ...formData,
      calories: parseInt(formData.calories),
      price: parseInt(formData.price),
      ingredients: formData.ingredients.split(',').map(i => i.trim()),
    };

    try {
      if (editingId) {
        await menuApi.updateMenu(editingId, payload);
        alert('Updated!');
      } else {
        await menuApi.createMenu(payload);
        alert('Created!');
      }
      resetForm();
      fetchAllMenus();
      setView('all');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      await menuApi.deleteMenu(id);
      alert('Deleted!');
      fetchAllMenus();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (menu) => {
    setFormData({
      name: menu.name,
      category: menu.category,
      calories: menu.calories,
      price: menu.price,
      ingredients: menu.ingredients.join(', '),
      description: menu.description,
    });
    setEditingId(menu.id);
    setView('create');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      calories: '',
      price: '',
      ingredients: '',
      description: '',
    });
    setEditingId(null);
  };

  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      try {
        const json = await menuApi.getAllMenus();
        setMenus(json.data);
      } catch (err) {
        alert('Error: ' + err.message);
      }
      setLoading(false);
    };
    loadMenus();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Menu Catalog</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => { setView('all'); fetchAllMenus(); }} style={{ marginRight: '10px' }}>
          All Menus
        </button>
        <button onClick={() => handleGrouped('count')} style={{ marginRight: '10px' }}>
          Count by Category
        </button>
        <button onClick={() => handleGrouped('list')} style={{ marginRight: '10px' }}>
          List by Category
        </button>
        <button onClick={() => { setView('create'); resetForm(); }} style={{ marginRight: '10px' }}>
          New Menu
        </button>
        <button onClick={() => { setView('generateAI'); }}>
          Generate with AI
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading...</p>}

      {view === 'generateAI' && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h2>Generate Menu with AI</h2>
          <p>Enter a category and AI will generate a menu item:</p>
          <input
            type="text"
            placeholder="e.g., drinks, desserts, appetizers"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <button 
            onClick={async () => {
              if (!formData.category.trim()) {
                alert('Enter a category');
                return;
              }
              setLoading(true);
              try {
                const generated = await menuApi.generateMenuWithAI(formData.category);
                setFormData({
                  name: generated.name,
                  category: generated.category,
                  calories: generated.calories.toString(),
                  price: generated.price.toString(),
                  ingredients: generated.ingredients.join(', '),
                  description: generated.description,
                });
                alert('Generated! Review and submit below.');
              } catch (err) {
                alert('Error: ' + err.message);
              }
              setLoading(false);
            }}
            style={{ marginRight: '10px' }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <button onClick={() => { setView('all'); resetForm(); }}>
            Cancel
          </button>

          {formData.name && (
            <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px' }}>
              <h3>Generated Menu Item:</h3>
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Category:</strong> {formData.category}</p>
              <p><strong>Calories:</strong> {formData.calories}</p>
              <p><strong>Price:</strong> {formData.price}</p>
              <p><strong>Ingredients:</strong> {formData.ingredients}</p>
              <p><strong>Description:</strong> {formData.description}</p>
              <button 
                onClick={handleSubmit}
                style={{ marginRight: '10px' }}
              >
                Save to Database
              </button>
              <button onClick={() => resetForm()}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'create' && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h2>{editingId ? 'Edit Menu' : 'Create Menu'}</h2>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <input
            type="number"
            placeholder="Calories"
            value={formData.calories}
            onChange={(e) => setFormData({...formData, calories: e.target.value})}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <textarea
            placeholder="Ingredients (comma-separated)"
            value={formData.ingredients}
            onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%', height: '60px' }}
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%', height: '60px' }}
          />
          <button onClick={handleSubmit} style={{ marginRight: '10px' }}>
            {editingId ? 'Update' : 'Create'}
          </button>
          <button onClick={() => { setView('all'); resetForm(); }}>
            Cancel
          </button>
        </div>
      )}

      {view === 'all' && !loading && (
        <div>
          <h2>All Menus</h2>
          {menus.map((menu) => (
            <div key={menu.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h3>{menu.name}</h3>
              <p>{menu._id}</p>
              <p>{menu.category} | {menu.calories} cal | Rp{menu.price}</p>
              <p>{menu.description}</p>
              <p><strong>Ingredients:</strong> {menu.ingredients.join(', ')}</p>
              <button onClick={() => handleEdit(menu)} style={{ marginRight: '10px' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(menu.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {view === 'search' && !loading && (
        <div>
          <h2>Search Results</h2>
          {menus.map((menu) => (
            <div key={menu.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h3>{menu.name}</h3>
              <p>{menu.category} | {menu.calories} cal | Rp{menu.price}</p>
              <button onClick={() => handleEdit(menu)} style={{ marginRight: '10px' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(menu.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {view === 'grouped' && !loading && (
        <div>
          <h2>Grouped by Category</h2>
          {Object.entries(grouped).map(([category, data]) => (
            <div key={category} style={{ marginBottom: '20px' }}>
              <h3>{category}</h3>
              {typeof data === 'number' ? (
                <p>Count: {data}</p>
              ) : (
                <div>
                  {data.map((menu) => (
                    <div key={menu.id} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                      <p><strong>{menu.name}</strong> - {menu.calories} cal - Rp{menu.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}