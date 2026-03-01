<template>
  <div class="app" v-cloak>
    <!-- Главная страница -->
    <Home v-if="!user && currentView === 'home'" @navigate="navigate" />
    
    <!-- Авторизация -->
    <Auth v-else-if="currentView === 'auth'" @login="handleLogin" @navigate="navigate" />
    
    <!-- Основное приложение -->
    <div v-else class="app-layout">
      <Sidebar :user="user" :view="currentView" @navigate="navigate" @logout="logout" />
      
      <main class="main-content">
        <Catalog v-if="currentView === 'catalog'" @selectBook="selectBook" />
        <MyBooks v-else-if="currentView === 'my-books'" />
        <Favorites v-else-if="currentView === 'favorites'" />
        <AdminPanel v-else-if="currentView === 'admin' && user?.role === 'admin'" />
      </main>
    </div>

    <!-- Модальное окно книги -->
    <BookModal 
      v-if="selectedBook" 
      :book="selectedBook" 
      :user="user"
      @close="selectedBook = null"
    />
    
    <!-- Toast уведомления -->
    <Toast v-if="notification" :message="notification.message" :type="notification.type" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Home from './pages/Home.vue'
import Auth from './pages/Auth.vue'
import Sidebar from './components/Sidebar.vue'
import Catalog from './pages/Catalog.vue'
import MyBooks from './pages/MyBooks.vue'
import Favorites from './pages/Favorites.vue'
import AdminPanel from './pages/AdminPanel.vue'
import BookModal from './components/BookModal.vue'
import Toast from './components/Toast.vue'

const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const currentView = ref('home')
const selectedBook = ref(null)
const notification = ref(null)

const navigate = (view) => {
  currentView.value = view
}

const handleLogin = (userData) => {
  user.value = userData
  localStorage.setItem('user', JSON.stringify(userData))
  currentView.value = 'catalog'
  showNotification('Добро пожаловать!', 'success')
}

const logout = () => {
  user.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  currentView.value = 'home'
}

const selectBook = (book) => {
  selectedBook.value = book
}

const showNotification = (message, type = 'info') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
}

.app-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}
</style>