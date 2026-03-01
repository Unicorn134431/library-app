<template>
  <div class="admin-section">
    <div class="admin-header">
      <h1>⚙️ Админ-панель</h1>
      <div class="admin-tabs">
        <button 
          @click="adminTab = 'dashboard'"
          :class="{ 'active': adminTab === 'dashboard' }"
          class="admin-tab"
        >
          <i class="fas fa-chart-line"></i> Дашборд
        </button>
        <button 
          @click="adminTab = 'books'"
          :class="{ 'active': adminTab === 'books' }"
          class="admin-tab"
        >
          <i class="fas fa-book"></i> Книги
        </button>
        <button 
          @click="adminTab = 'reservations'"
          :class="{ 'active': adminTab === 'reservations' }"
          class="admin-tab"
        >
          <i class="fas fa-bookmark"></i> Бронирования
        </button>
        <button 
          @click="adminTab = 'users'"
          :class="{ 'active': adminTab === 'users' }"
          class="admin-tab"
        >
          <i class="fas fa-users"></i> Пользователи
        </button>
      </div>
    </div>

    <!-- ДАШБОРД -->
    <div v-if="adminTab === 'dashboard'" class="dashboard">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-info">
            <p>Всего книг</p>
            <h3>{{ stats.total_books || 0 }}</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <p>Пользователей</p>
            <h3>{{ stats.total_users || 0 }}</h3>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-bookmark"></i>
          </div>
          <div class="stat-info">
            <p>Активных бронирований</p>
            <h3>{{ stats.active_reservations || 0 }}</h3>
          </div>
        </div>

        <div class="stat-card alert">
          <div class="stat-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-info">
            <p>Просрочено</p>
            <h3>{{ stats.overdue_reservations || 0 }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- УПРАВЛЕНИЕ КНИГАМИ -->
    <div v-if="adminTab === 'books'" class="books-management">
      <div class="management-header">
        <h2>Управление книгами</h2>
        <button @click="showAddBookForm = true" class="btn-primary">
          <i class="fas fa-plus"></i> Добавить книгу
        </button>
      </div>

      <!-- ФОРМА ДОБАВЛЕНИЯ КНИГИ -->
      <div v-if="showAddBookForm" class="add-book-form">
        <form @submit.prevent="addBook">
          <div class="form-row">
            <div class="form-group">
              <label>Название</label>
              <input v-model="newBook.title" required>
            </div>
            <div class="form-group">
              <label>Автор</label>
              <input v-model="newBook.author" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Категория</label>
              <select v-model="newBook.category">
                <option value="IT">IT</option>
                <option value="Проза">Проза</option>
                <option value="Наука">Наука</option>
                <option value="Дизайн">Дизайн</option>
              </select>
            </div>
            <div class="form-group">
              <label>Количество копий</label>
              <input v-model.number="newBook.total_copies" type="number" min="1">
            </div>
          </div>

          <div class="form-group">
            <label>URL обложки</label>
            <input v-model="newBook.image_url" placeholder="https://...">
          </div>

          <div class="form-buttons">
            <button type="submit" class="btn-success">
              <i class="fas fa-save"></i> Добавить
            </button>
            <button type="button" @click="showAddBookForm = false" class="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>

      <!-- ТАБЛИЦА КНИГ -->
      <table v-if="allBooks.length > 0">
        <thead>
          <tr>
            <th>Название</th>
            <th>Автор</th>
            <th>Категория</th>
            <th>Доступно</th>
            <th>Всего</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in allBooks" :key="book.id">
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.category }}</td>
            <td>{{ book.available_copies }}</td>
            <td>{{ book.total_copies }}</td>
            <td class="actions">
              <button @click="editBook(book)" class="btn-sm" title="Редактировать">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteBook(book.id)" class="btn-sm btn-danger" title="Удалить">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- УПРАВЛЕНИЕ БРОНИРОВАНИЯМИ -->
    <div v-if="adminTab === 'reservations'" class="reservations-management">
      <h2>Все бронирования</h2>

      <table v-if="allReservations.length > 0">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Книга</th>
            <th>Дата бронирования</th>
            <th>Возврат</th>
            <th>Статус</th>
            <th>Дней осталось</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in allReservations" :key="res.id">
            <td>{{ res.login }}</td>
            <td>{{ res.title }}</td>
            <td>{{ formatDate(res.reserved_at) }}</td>
            <td>{{ formatDate(res.due_date) }}</td>
            <td>
              <span :class="'status-' + res.status" class="status-badge">
                {{ res.status }}
              </span>
            </td>
            <td :class="{ 'text-danger': res.days_left < 0 }">
              {{ res.days_left }}
            </td>
            <td>
              <select 
                :value="res.status"
                @change="changeReservationStatus(res.id, $event.target.value)"
                class="status-select"
              >
                <option value="active">Активное</option>
                <option value="returned">Возвращено</option>
                <option value="overdue">Просрочено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ -->
    <div v-if="adminTab === 'users'" class="users-management">
      <h2>Пользователи системы</h2>

      <table v-if="allUsers.length > 0">
        <thead>
          <tr>
            <th>Логин</th>
            <th>Email</th>
            <th>Имя</th>
            <th>Роль</th>
            <th>Активных бронирований</th>
            <th>Дата регистрации</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in allUsers" :key="user.id">
            <td>{{ user.login }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.full_name }}</td>
            <td>
              <span :class="user.role === 'admin' ? 'badge-admin' : 'badge-user'" class="role-badge">
                {{ user.role === 'admin' ? '👨‍💼 Админ' : '👨‍🎓 Студент' }}
              </span>
            </td>
            <td>{{ user.active_reservations }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const adminTab = ref('dashboard')
const token = localStorage.getItem('token')
const stats = ref({})
const allBooks = ref([])
const allReservations = ref([])
const allUsers = ref([])
const showAddBookForm = ref(false)
const newBook = ref({
  title: '',
  author: '',
  category: 'IT',
  image_url: '',
  total_copies: 5
})

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU')
}

const loadDashboard = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    stats.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке статистики:', error)
  }
}

const loadBooks = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/books', {
      headers: { Authorization: `Bearer ${token}` }
    })
    allBooks.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке книг:', error)
  }
}

const loadReservations = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/admin/reservations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    allReservations.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке бронирований:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    allUsers.value = response.data
  } catch (error) {
    console.error('Ошибка при загрузке пользователей:', error)
  }
}

const addBook = async () => {
  try {
    await axios.post('http://localhost:3000/api/admin/books', newBook.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showAddBookForm.value = false
    newBook.value = { title: '', author: '', category: 'IT', image_url: '', total_copies: 5 }
    await loadBooks()
  } catch (error) {
    console.error('Ошибка при добавлении книги:', error)
  }
}

const deleteBook = async (bookId) => {
  if (!confirm('Вы уверены?')) return
  try {
    await axios.delete(`http://localhost:3000/api/admin/books/${bookId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    await loadBooks()
  } catch (error) {
    console.error('Ошибка при удалении книги:', error)
  }
}

const changeReservationStatus = async (reservationId, status) => {
  try {
    await axios.put(`http://localhost:3000/api/admin/reservations/${reservationId}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    await loadReservations()
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error)
  }
}

const editBook = (book) => {
  console.log('Редактирование:', book)
}

onMounted(async () => {
  await loadDashboard()
  await loadBooks()
  await loadReservations()
  await loadUsers()
})
</script>

<style scoped>
.admin-section {
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.admin-header h1 {
  font-size: 28px;
  font-weight: 700;
}

.admin-tabs {
  display: flex;
  gap: 8px;
}

.admin-tab {
  padding: 10px 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin-tab.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.admin-tab:hover {
  border-color: #6366f1;
}

.dashboard {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-card.alert {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1, #f97316);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
}

.stat-card.alert .stat-icon {
  background: #ef4444;
}

.stat-info h3 {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.stat-info p {
  font-size: 14px;
  color: #6b7280;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.management-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.add-book-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.form-buttons button {
  flex: 1;
}

table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-returned {
  background: #dbeafe;
  color: #0c4a6e;
}

.status-overdue {
  background: #fee2e2;
  color: #7f1d1d;
}

.status-cancelled {
  background: #f3f4f6;
  color: #374151;
}

.status-select {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-admin {
  background: #fef3c7;
  color: #92400e;
}

.badge-user {
  background: #d1fae5;
  color: #065f46;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 8px 12px !important;
  font-size: 12px !important;
}

@media (max-width: 768px) {
  .admin-tabs {
    flex-wrap: wrap;
  }

  .management-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>