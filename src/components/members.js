import { db } from '../db/database.js';

export default async function renderMembers(container) {
  const members = await db.members.toArray();

  container.innerHTML = `
    <div class="page-header">
      <h2>Members Directory</h2>
      <button class="btn" id="btn-add-member">
        <i data-lucide="user-plus"></i> Add New Member
      </button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Active Loans</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${await Promise.all(members.map(async member => {
            const activeLoans = await db.transactions
              .where('memberId').equals(member.id)
              .and(tx => tx.status === 'active')
              .count();
              
            return `
              <tr>
                <td><strong>${member.name}</strong></td>
                <td>${member.email}</td>
                <td>${member.phone}</td>
                <td>
                  <span class="badge ${activeLoans > 0 ? 'badge-warning' : 'badge-success'}">
                    ${activeLoans} Books
                  </span>
                </td>
                <td class="table-row-actions">
                  <button class="icon-btn btn-issue" data-id="${member.id}" aria-label="Issue Book" title="Issue Book">
                    <i data-lucide="book-up"></i>
                  </button>
                  <button class="icon-btn btn-return" data-id="${member.id}" aria-label="Return Book" title="Return Book">
                    <i data-lucide="book-down"></i>
                  </button>
                  <button class="icon-btn btn-delete btn-danger-icon" data-id="${member.id}" aria-label="Delete Member" style="color: var(--danger-color)">
                    <i data-lucide="user-minus"></i>
                  </button>
                </td>
              </tr>
            `;
          })).then(rows => rows.join(''))}
          ${members.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:var(--text-secondary)">No members found</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach Event Listeners
  document.getElementById('btn-add-member').addEventListener('click', () => {
    showAddMemberModal(container);
  });
  
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      // Check for active loans before deleting
      const activeLoans = await db.transactions
        .where('memberId').equals(id)
        .and(tx => tx.status === 'active')
        .count();
        
      if (activeLoans > 0) {
        alert('Cannot delete member. They have active book loans.');
        return;
      }

      if (confirm('Are you sure you want to delete this member?')) {
        await db.members.delete(id);
        renderMembers(container); // Re-render
      }
    });
  });

  container.querySelectorAll('.btn-issue').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      showIssueBookModal(container, id);
    });
  });

  container.querySelectorAll('.btn-return').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      showReturnBookModal(container, id);
    });
  });
}

function showAddMemberModal(container) {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" id="add-member-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add New Member</h2>
          <button class="icon-btn" id="btn-close-modal">
            <i data-lucide="x"></i>
          </button>
        </div>
        <form id="add-member-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="form-control" name="name" required placeholder="e.g. John Doe">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" name="email" required placeholder="e.g. john@example.com">
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" class="form-control" name="phone" required placeholder="e.g. 555-0199">
          </div>
          <div style="display:flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn">Save Member</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  if (window.lucide) window.lucide.createIcons();
  
  const closeModal = () => {
    modalContainer.innerHTML = '';
  };
  
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('add-member-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  document.getElementById('add-member-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newMember = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };
    
    await db.members.add(newMember);
    closeModal();
    renderMembers(container);
  });
}

async function showIssueBookModal(container, memberId) {
  const modalContainer = document.getElementById('modal-container');
  const availableBooks = await db.books.where('status').equals('available').toArray();
  const member = await db.members.get(memberId);
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" id="issue-book-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Issue Book to ${member.name}</h2>
          <button class="icon-btn" id="btn-close-modal">
            <i data-lucide="x"></i>
          </button>
        </div>
        <form id="issue-book-form">
          <div class="form-group">
            <label>Select Book</label>
            <select class="form-control" name="bookId" required>
              <option value="" disabled selected>Choose a book...</option>
              ${availableBooks.map(book => `<option value="${book.id}">${book.title} (by ${book.author})</option>`).join('')}
            </select>
          </div>
          ${availableBooks.length === 0 ? '<p style="color:var(--danger-color);font-size:0.85rem;">No books currently available.</p>' : ''}
          <div style="display:flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn" ${availableBooks.length === 0 ? 'disabled' : ''}>Issue Book</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  if (window.lucide) window.lucide.createIcons();
  
  const closeModal = () => {
    modalContainer.innerHTML = '';
  };
  
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('issue-book-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  document.getElementById('issue-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookId = parseInt(formData.get('bookId'));
    
    // Create transaction
    await db.transactions.add({
      bookId: bookId,
      memberId: memberId,
      issueDate: new Date().toISOString(),
      returnDate: null,
      status: 'active'
    });
    
    // Update book status
    await db.books.update(bookId, { status: 'issued' });
    
    closeModal();
    renderMembers(container);
  });
}

async function showReturnBookModal(container, memberId) {
  const modalContainer = document.getElementById('modal-container');
  const activeTransactions = await db.transactions
    .where('memberId').equals(memberId)
    .and(tx => tx.status === 'active')
    .toArray();
    
  // Fetch book details for each transaction
  const booksToReturn = await Promise.all(activeTransactions.map(async tx => {
    const book = await db.books.get(tx.bookId);
    return { ...tx, bookTitle: book.title };
  }));
  
  const member = await db.members.get(memberId);
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" id="return-book-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Return Book from ${member.name}</h2>
          <button class="icon-btn" id="btn-close-modal">
            <i data-lucide="x"></i>
          </button>
        </div>
        <form id="return-book-form">
          <div class="form-group">
            <label>Select Book to Return</label>
            <select class="form-control" name="transactionId" required>
              <option value="" disabled selected>Choose a book...</option>
              ${booksToReturn.map(tx => `<option value="${tx.id}">${tx.bookTitle} (Issued on ${new Date(tx.issueDate).toLocaleDateString()})</option>`).join('')}
            </select>
          </div>
          ${activeTransactions.length === 0 ? '<p style="color:var(--text-secondary);font-size:0.85rem;">No active loans to return.</p>' : ''}
          <div style="display:flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn" ${activeTransactions.length === 0 ? 'disabled' : ''}>Process Return</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  if (window.lucide) window.lucide.createIcons();
  
  const closeModal = () => {
    modalContainer.innerHTML = '';
  };
  
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('return-book-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  document.getElementById('return-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const transactionId = parseInt(formData.get('transactionId'));
    
    const tx = await db.transactions.get(transactionId);
    
    // Update transaction
    await db.transactions.update(transactionId, { 
      status: 'returned',
      returnDate: new Date().toISOString()
    });
    
    // Update book status
    await db.books.update(tx.bookId, { status: 'available' });
    
    closeModal();
    renderMembers(container);
  });
}
