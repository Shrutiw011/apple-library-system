import { db } from '../db/database.js';

export default async function renderDashboard(container) {
  // Fetch stats from Dexie
  const totalBooks = await db.books.count();
  const availableBooks = await db.books.where('status').equals('available').count();
  const issuedBooks = totalBooks - availableBooks;
  const totalMembers = await db.members.count();
  
  // Get recent transactions
  const recentTransactions = await db.transactions
    .orderBy('issueDate')
    .reverse()
    .limit(5)
    .toArray();

  container.innerHTML = `
    <div class="page-header">
      <h2>Dashboard</h2>
    </div>

    <div class="dashboard-grid">
      <div class="card stat-card">
        <div class="stat-icon">
          <i data-lucide="library"></i>
        </div>
        <div class="stat-info">
          <h3>Total Books</h3>
          <div class="value">${totalBooks}</div>
        </div>
      </div>
      
      <div class="card stat-card">
        <div class="stat-icon">
          <i data-lucide="book-open-check"></i>
        </div>
        <div class="stat-info">
          <h3>Available Books</h3>
          <div class="value">${availableBooks}</div>
        </div>
      </div>
      
      <div class="card stat-card">
        <div class="stat-icon">
          <i data-lucide="book-x"></i>
        </div>
        <div class="stat-info">
          <h3>Issued Books</h3>
          <div class="value">${issuedBooks}</div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon">
          <i data-lucide="users"></i>
        </div>
        <div class="stat-info">
          <h3>Total Members</h3>
          <div class="value">${totalMembers}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="list-header">
        <h3>Recent Transactions</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Member</th>
            <th>Issue Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            recentTransactions.length > 0 ? 
            (await Promise.all(recentTransactions.map(async tx => {
              const book = await db.books.get(tx.bookId);
              const member = await db.members.get(tx.memberId);
              const date = new Date(tx.issueDate).toLocaleDateString();
              const badgeClass = tx.status === 'active' ? 'badge-warning' : 'badge-success';
              const statusText = tx.status === 'active' ? 'Issued' : 'Returned';

              return `
                <tr>
                  <td><strong>${book?.title || 'Unknown Book'}</strong></td>
                  <td>${member?.name || 'Unknown Member'}</td>
                  <td>${date}</td>
                  <td><span class="badge ${badgeClass}">${statusText}</span></td>
                </tr>
              `;
            }))).join('') : 
            `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary)">No recent transactions</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}
