<template>
  <div class="catalog-section">
    <div class="catalog-header">
      <h1 class="title-large">📚 Библиотека</h1>
      <p class="subtitle">Откройте мир знаний</p>
    </div>
    
    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="search" placeholder="Поиск по названию или автору...">
      </div>
      <select v-model="selectedCategory" class="filter-select">
        <option value="">📚 Все категории</option>
        <option value="IT">💻 IT & Программирование</option>
        <option value="Проза">✍️ Художественная проза</option>
        <option value="Наука">🔬 Наука & Образование</option>
        <option value="Дизайн">🎨 Дизайн & Искусство</option>
      </select>
    </div>

    <div class="books-grid">
      <div 
        v-for="book in filteredBooks" 
        :key="book.id" 
        class="book-card"
        @click="$emit('selectBook', book)"
      >
        <div class="book-image">
          <img :src="book.image_url" :alt="book.title" onerror="this.src='https://via.placeholder.com/300x400'">
          <div :class="['status', book.available_copies > 0 ? 'available' : 'unavailable']">
            {{ book.available_copies > 0 ? `${book.available_copies} в наличии` : 'Нет в наличии' }}
          </div>
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

    <div v-if="filteredBooks.length === 0" class="empty-state">
      <i class="fas fa-search"></i>
      <p>Книги не найдены</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const books = ref([])
const search = ref('')
const selectedCategory = ref('')

const filteredBooks = computed(() => {
  return books.value.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.value.toLowerCase()) ||
                       b.author.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = !selectedCategory.value || b.category === selectedCategory.value
    return matchSearch && matchCategory
  })
})

const API_URL = import.meta.env.VITE_API_URL  // <-- берём URL из .env

onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/books`)
    books.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке книг:', error)
  }
})

defineEmits(['selectBook'])
</script>

<style scoped>
.catalog-section {
  padding: 20px;
}

.catalog-header {
  margin-bottom: 32px;
}

.catalog-header p {
  margin-top: 8px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 40px !important;
}

.filter-select {
  min-width: 220px;
  background: white;
  font-weight: 500;
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

.status {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: white;
  font-family: 'Inter', sans-serif;
}

.status.available {
  background: rgba(16, 185, 129, 0.9);
}

.status.unavailable {
  background: rgba(239, 68, 68, 0.9);
}

.book-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.book-info h3 {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author {
  font-size: 13px;
  color: #6b7280;
  font-family: 'Inter', sans-serif;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f59e0b;
  margin-top: auto;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .search-box {
    min-width: unset;
  }

  .filter-select {
    min-width: unset;
    width: 100%;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>