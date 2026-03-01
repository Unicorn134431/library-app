<template>
  <div class="favorites-section">
    <h1>❤️ Избранные книги</h1>

    <div v-if="favorites.length === 0" class="empty-state">
      <i class="fas fa-heart"></i>
      <p>Нет избранных книг</p>
    </div>

    <div v-else class="books-grid">
      <div 
        v-for="book in favorites" 
        :key="book.id" 
        class="book-card"
        @click="selectBook(book)"
      >
        <div class="book-image">
          <img :src="book.image_url" :alt="book.title" onerror="this.src='https://via.placeholder.com/300x400'">
          <button 
            @click.stop="removeFavorite(book.id)"
            class="favorite-btn active"
          >
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p class="author">{{ book.author }}</p>
          <div v-if="book.average_rating" class="rating">
            <i class="fas fa-star"></i>
            <span>{{ book.average_rating }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const favorites = ref([])
const token = localStorage.getItem('token')

const API_URL = import.meta.env.VITE_API_URL  // <-- берём URL из .env

const removeFavorite = async (bookId) => {
  try {
    await axios.delete(`${API_URL}/books/favorites/${bookId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    favorites.value = favorites.value.filter(b => b.id !== bookId)
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error)
  }
}

const selectBook = (book) => {
  window.selectedBook = book
  window.dispatchEvent(new CustomEvent('selectBook', { detail: book }))
}

onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/books/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    favorites.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке избранного:', error)
  }
})
</script>

<style scoped>
.favorites-section {
  padding: 20px;
}

.favorites-section h1 {
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
  display: block;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.book-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.book-image {
  position: relative;
  overflow: hidden;
  height: 280px;
  background: #f3f4f6;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
}

.book-card:hover .book-image img {
  transform: scale(1.05);
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  font-size: 18px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.book-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.book-info h3 {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author {
  font-size: 12px;
  color: #6b7280;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f59e0b;
  margin-top: auto;
}
</style>