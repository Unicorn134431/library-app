<template>
  <div class="my-books-section">
    <h1>📖 Мои бронирования</h1>

    <div v-if="reservations.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>Вы пока не забронировали книги</p>
      <button @click="goToCatalog" class="btn-primary">
        Перейти в каталог
      </button>
    </div>

    <div v-else class="reservations-list">
      <div v-for="res in reservations" :key="res.id" class="reservation-card">
        <img :src="res.image_url" :alt="res.title" class="book-image" onerror="this.src='https://via.placeholder.com/100x150'">
        <div class="res-info">
          <h3>{{ res.title }}</h3>
          <p class="author">{{ res.author }}</p>
          <p class="date">
            <i class="fas fa-calendar"></i> Возврат: {{ formatDate(res.due_date) }}
          </p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: calculateProgress(res.due_date) + '%' }"></div>
          </div>
          <small :class="{ 'text-danger': res.days_left < 0 }">
            {{ res.days_left >= 0 ? `Осталось ${res.days_left} дней` : `Просрочено на ${Math.abs(res.days_left)} дней` }}
          </small>
        </div>
        <button @click="returnBook(res.id)" class="btn-return">
          <i class="fas fa-undo"></i> Вернуть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const reservations = ref([])
const token = localStorage.getItem('token')

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU')
}

const calculateProgress = (due_date) => {
  const today = new Date()
  const dueDate = new Date(due_date)
  const reservedDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
  const total = dueDate - reservedDate
  const passed = today - reservedDate
  return Math.min((passed / total) * 100, 100)
}

const API_URL = import.meta.env.VITE_API_URL  // <-- берём URL из переменной окружения

const returnBook = async (reservationId) => {
  try {
    await axios.post(
      `${API_URL}/reservations/${reservationId}/return`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    reservations.value = reservations.value.filter(r => r.id !== reservationId)
  } catch (error) {
    console.error('Ошибка при возврате:', error)
  }
}

const goToCatalog = () => {
  window.location.hash = '#catalog'
}

onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/reservations/user/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    reservations.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке бронирований:', error)
  }
})
</script>

<style scoped>
.my-books-section {
  padding: 20px;
}

.my-books-section h1 {
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

.empty-state p {
  margin-bottom: 20px;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
}

.reservation-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.reservation-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.book-image {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

.res-info {
  flex: 1;
}

.res-info h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.author {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.date {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b);
  border-radius: 2px;
  transition: width 0.3s;
}

.btn-return {
  padding: 10px 16px;
  background: transparent;
  color: #6366f1;
  border: 2px solid #6366f1;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-return:hover {
  background: #f0f4ff;
}

@media (max-width: 768px) {
  .reservation-card {
    flex-direction: column;
  }

  .book-image {
    width: 100%;
    height: 200px;
  }
}
</style>