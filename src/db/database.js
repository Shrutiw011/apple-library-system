import Dexie from 'dexie';

export const db = new Dexie('ShikshaLibraryDB');

db.version(1).stores({
  books: '++id, title, author, category, status', // status: 'available' | 'issued'
  members: '++id, name, email, phone',
  transactions: '++id, bookId, memberId, issueDate, returnDate, status' // status: 'active' | 'returned'
});

db.on('populate', () => {
  db.books.bulkAdd([
    {
      title: 'The Design of Everyday Things',
      author: 'Don Norman',
      category: 'Design',
      status: 'available',
      cover: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Technology',
      status: 'available',
      cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: '1984',
      author: 'George Orwell',
      category: 'Fiction',
      status: 'issued',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'
    }
  ]);
  
  db.members.bulkAdd([
    { name: 'Alice Smith', email: 'alice@example.com', phone: '555-0101' },
    { name: 'Bob Jones', email: 'bob@example.com', phone: '555-0102' }
  ]);

  const issueDate = new Date().toISOString();
  db.transactions.add({
    bookId: 3, // 1984
    memberId: 1, // Alice Smith
    issueDate: issueDate,
    returnDate: null,
    status: 'active'
  });
});
