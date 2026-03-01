<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <div class="book-modal">
        <div class="book-image-large">
          <img :src="book.image_url" :alt="book.title" @error="onImageError">
        </div>

        <div class="book-details">
          <h1>{{ book.title }}</h1>
          <p class="author">{{ book.author }}</p>

          <div class="info-section">
            <div v-if="book.category" class="info-item">
              <strong>Категория:</strong> {{ book.category }}
            </div>
            <div class="info-item">
              <strong>Доступно:</strong> {{ book.available_copies }}/{{ book.total_copies }}
            </div>
            <div v-if="book.publication_year" class="info-item">
              <strong>Год:</strong> {{ book.publication_year }}
            </div>
          </div>

          <div v-if="book.description" class="description">
            {{ book.description }}
          </div>

          <!-- Рейтинг -->
          <div class="rating-section">
            <h3>Рейтинг</h3>
            <div class="rating-display">
              <div class="average-rating">
                <span class="big-rating">{{ book.average_rating || '—' }}</span>
                <span class="total-ratings">({{ book.total_ratings || 0 }} оценок)</span>
              </div>
              <div v-if="user" class="user-rating">
                <p>Ваша оценка:</p>
                <div class="stars">
                  <button 
                    v-for="i in 5" 
                    :key="i"
                    @click="rateBook(i)"
                    :class="{ 'active': userRating === i }"
                    class="star-btn"
                  >
                    <i class="fas fa-star"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки действия -->
          <div class="action-buttons">
            <button 
              v-if="user && book.available_copies > 0"
              @click="reserveBook"
              class="btn-primary"
              :disabled="isReserving || isReserved"
            >
              <i class="fas fa-bookmark"></i>
              {{ isReserved ? 'Уже забронировано' : (isReserving ? 'Загрузка...' : 'Забронировать') }}
            </button>

            <button v-else-if="book.available_copies <= 0" class="btn-disabled">
              <i class="fas fa-lock"></i> Нет в наличии
            </button>

            <button 
              v-if="user"
              @click="toggleFavorite"
              :class="{ 'active': isFavorite }"
              class="btn-favorite"
            >
              <i :class="isFavorite ? 'fas' : 'far'"></i>
              <i class="fas fa-heart"></i>
            </button>

            <button v-if="!user" @click="goToAuth" class="btn-secondary">
              Войти для бронирования
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  book: Object,
  user: Object
})

const emit = defineEmits(['close'])

const token = localStorage.getItem('token')
const userRating = ref(0)
const isFavorite = ref(false)
const isReserving = ref(false)
const isReserved = ref(false) // отслеживаем бронирование

const API_URL = import.meta.env.VITE_API_URL  // <-- берём URL из переменной окружения

const onImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/300x400'
}

// Загрузка рейтинга и избранного при открытии модалки
onMounted(async () => {
  if (!token) return

  try {
    const ratingResponse = await axios.get(`${API_URL}/books/${props.book.id}/rating`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (ratingResponse.data.has_rating) userRating.value = ratingResponse.data.rating

    const favResponse = await axios.get(`${API_URL}/books/favorites/check/${props.book.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    isFavorite.value = favResponse.data.is_favorite
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error)
  }
})

// Оценка книги
const rateBook = async (rating) => {
  if (!token) return

  try {
    await axios.post(`${API_URL}/books/${props.book.id}/rating`, 
      { rating },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    userRating.value = rating
  } catch (error) {
    console.error('Ошибка при оценке:', error)
  }
}

// Добавление/удаление из избранного
const toggleFavorite = async () => {
  if (!token) return

  try {
    if (isFavorite.value) {
      await axios.delete(`${API_URL}/books/favorites/${props.book.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      await axios.post(`${API_URL}/books/favorites/add`,
        { book_id: props.book.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    }
    isFavorite.value = !isFavorite.value
  } catch (error) {
    console.error('Ошибка при работе с избранным:', error)
  }
}

// Бронирование книги
const reserveBook = async () => {
  if (!token || isReserving.value || isReserved.value) return

  isReserving.value = true
  try {
    await axios.post(`${API_URL}/books/${props.book.id}/reserve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    isReserved.value = true
  } catch (error) {
    console.error('Ошибка при бронировании:', error)
  } finally {
    isReserving.value = false
  }
}

// Переход к авторизации
const goToAuth = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: #111827;
  transition: all 0.3s;
  z-index: 10;
}

.modal-close:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.book-modal {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  padding: 40px;
}

.book-image-large {
  position: sticky;
  top: 20px;
}

.book-image-large img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.book-details h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.author {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 16px;
}

.info-section {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-item {
  font-size: 14px;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.description {
  margin-bottom: 24px;
  line-height: 1.6;
  color: #4b5563;
}

.rating-section {
  margin-bottom: 32px;
}

.rating-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.rating-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 16px;
}

.big-rating {
  font-size: 32px;
  font-weight: 700;
  color: #f59e0b;
}

.total-ratings {
  font-size: 12px;
  color: #6b7280;
}

.user-rating {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-rating p {
  font-size: 14px;
  font-weight: 600;
}

.stars {
  display: flex;
  gap: 8px;
}

.star-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  color: #d1d5db;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.star-btn.active {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #f59e0b;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.btn-primary {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.btn-favorite {
  padding: 12px 24px;
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-favorite:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-favorite.active {
  background: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
}

.btn-disabled {
  padding: 12px 24px;
  background: #d1d5db;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .book-modal {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 20px;
  }

  .book-image-large {
    position: static;
  }

  .rating-display {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>