// File: client/src/pages/AddExpensePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AddExpensePage() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitWith, setSplitWith] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const split_with_usernames = splitWith
        .split(',')
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      await api.post('/expenses', {
        description,
        amount: parseFloat(amount),
        category,
        date,
        split_with_usernames,
      });
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to add expense');
    }
  };

  return (
    <>
      <header className="admin-header">
        <h1>Add New Expense</h1>
        <nav>
          <button 
            onClick={() => navigate('/')} 
            className="logout-button" 
            style={{ background: 'var(--admin-accent)' }}
          >
            &larr; Back to Dashboard
          </button>
        </nav>
      </header>

      <main className="admin-container">
        <section className="data-section">
          <h2>Expense Details</h2>
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              <div>
                <label>Description (Item):</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Amount (₹):</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Category:</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label>Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <h2 style={{marginTop: '30px', borderTop: '1px solid var(--border-color-admin)', paddingTop: '20px'}}>
                Split this bill? (Optional)
              </h2>
              <div>
                <label>Split with usernames (comma-separated):</label>
                <input
                  type="text"
                  placeholder="e.g., harish, preetham123"
                  value={splitWith}
                  onChange={(e) => setSplitWith(e.target.value)}
                />
              </div>

              {error && <p style={{ color: 'var(--error-color)', fontWeight: '600' }}>{error}</p>}
              
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Add Expense'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

export default AddExpensePage;