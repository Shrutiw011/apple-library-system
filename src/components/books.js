import { db } from '../db/database.js';

export default async function renderBooks(container) {
  const books = await db.books.toArray();

  container.innerHTML = `
    <div class="page-header">
      <h2>Books Inventory</h2>
      <button class="btn" id="btn-add-book">
        <i data-lucide="plus"></i> Add New Book
      </button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${books.map(book => `
            <tr>
              <td>
                <img src="${book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400'}" alt="Cover" class="book-cover">
              </td>
              <td><strong>${book.title}</strong></td>
              <td>${book.author}</td>
              <td>${book.category}</td>
              <td>
                <span class="badge ${book.status === 'available' ? 'badge-success' : 'badge-warning'}">
                  ${book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                </span>
              </td>
              <td class="table-row-actions">
                <button class="icon-btn btn-delete" data-id="${book.id}" aria-label="Delete">
                  <i data-lucide="trash-2"></i>
                </button>
              </td>
            </tr>
          `).join('')}
          ${books.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary)">No books found</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach Event Listeners
  document.getElementById('btn-add-book').addEventListener('click', () => {
    showAddBookModal(container);
  });
  
  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      if (confirm('Are you sure you want to delete this book?')) {
        await db.books.delete(id);
        renderBooks(container);
      }
    });
  });
}

function showAddBookModal(container) {
  const modalContainer = document.getElementById('modal-container');
  
  modalContainer.innerHTML = `
    <div class="modal-overlay" id="add-book-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add New Book</h2>
          <button class="icon-btn" id="btn-close-modal">
            <i data-lucide="x"></i>
          </button>
        </div>
        <form id="add-book-form">
          <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" name="title" required placeholder="e.g. The Great Gatsby">
          </div>
          <div class="form-group">
            <label>Author</label>
            <input type="text" class="form-control" name="author" required placeholder="e.g. F. Scott Fitzgerald">
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" class="form-control" name="category" required placeholder="e.g. Fiction">
          </div>
          <div class="form-group">
            <label>Cover Image URL (Optional)</label>
            <input type="url" class="form-control" name="cover" placeholder="https://...">
          </div>
          <div style="display:flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn">Save Book</button>
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
  document.getElementById('add-book-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newBook = {
      title: formData.get('title'),
      author: formData.get('author'),
      category: formData.get('category'),
      cover: formData.get('cover') || '',
      status: 'available'
    };
    
    await db.books.add(newBook);
    closeModal();
    renderBooks(container);
  });
}
