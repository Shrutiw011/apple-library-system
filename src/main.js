import './style.css';
import renderDashboard from './components/dashboard.js';
import renderBooks from './components/books.js';
import renderMembers from './components/members.js';

// Theme management
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') document.body.setAttribute('data-theme', 'dark');

themeToggle.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  
  if (newTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i data-lucide="sun"></i>';
  } else {
    document.body.removeAttribute('data-theme');
    themeToggle.innerHTML = '<i data-lucide="moon"></i>';
  }
  
  localStorage.setItem('theme', newTheme);
  if (window.lucide) window.lucide.createIcons();
});

// View Navigation
const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

async function loadView(view) {
  // Update active state
  navItems.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

  mainContent.style.transition = 'opacity 0.2s ease-out';
  mainContent.style.opacity = 0;
  
  setTimeout(async () => {
    switch (view) {
      case 'dashboard':
        await renderDashboard(mainContent);
        break;
      case 'books':
        await renderBooks(mainContent);
        break;
      case 'members':
        await renderMembers(mainContent);
        break;
    }
    
    if (window.lucide) window.lucide.createIcons();
    mainContent.style.opacity = 1;
  }, 200);
}

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    loadView(btn.dataset.view);
  });
});

// Initial load
window.addEventListener('DOMContentLoaded', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  themeToggle.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
  if (window.lucide) window.lucide.createIcons();
  
  loadView('dashboard');
});
