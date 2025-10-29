// File: client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ExpenseChart from '../components/ExpenseChart.jsx';

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const summaryRes = await api.get('/dashboard');
        setSummary(summaryRes.data);
        const expensesRes = await api.get('/expenses');
        setExpenses(expensesRes.data.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
        if (err.response?.status === 401) handleLogout();
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', paddingTop: '100px', fontSize: '2em', color: 'white' }}>
      Loading Dashboard...
    </div>
  );

  return (
    <>
      {/* Admin Header */}
      <header className="admin-header">
        <h1 id="welcome-message">Expense Dashboard</h1>
        <nav>
          <Link 
            to="/add" 
            className="nav-link" 
            style={{ 
              background: 'var(--success-color)', 
              padding: '10px 15px', 
              borderRadius: '5px', 
              color: 'white' 
            }}
          >
            + Add Expense
          </Link>
          <button id="logout-btn" className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      {/* Admin Container */}
      <main className="admin-container">
        {/* Stats Grid for Summary */}
        {summary && (
          <section className="stats-grid">
            <div className="stat-card fees"> {/* fees = red border */}
              <h2>Total Spent (Your Share)</h2>
              <p>${summary.totalSpent.toFixed(2)}</p>
            </div>
            <div className="stat-card complaints"> {/* complaints = yellow border */}
              <h2>Average Expense</h2>
              <p>${summary.averageExpense.toFixed(2)}</p>
            </div>
            <div className="stat-card students"> {/* students = blue border */}
              <h2>Total Expenses</h2>
              <p>{summary.totalExpenses}</p>
            </div>
          </section>
        )}

        {/* Chart in its own container */}
        {summary && summary.chart.labels.length > 0 && (
          <div className="chart-container">
            <ExpenseChart chartData={summary.chart} />
          </div>
        )}

        {/* Data Section for Expenses List */}
        <section className="data-section" style={{ marginTop: '30px' }}>
          <h2>Recent Expenses</h2>
          <div className="table-container">
            <table id="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Paid By</th>
                  <th>Split (Your Share)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan="6">No expenses found.</td></tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td>{new Date(exp.date).toLocaleDateString()}</td>
                      <td>{exp.description}</td>
                      <td>{exp.category}</td>
                      <td>${exp.amount.toFixed(2)}</td>
                      <td>{exp.user.name}</td>
                      <td>
                        {exp.split_with.length > 0 ? `$${exp.split_share.toFixed(2)}` : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

export default DashboardPage;