<template>
  <aside class="sidebar">
    <div class="logo">
      <i class="fas fa-book"></i>
      <span>PRO+ LIB</span>
    </div>

    <nav class="nav-menu">
      <button 
        @click="$emit('navigate', 'catalog')" 
        :class="{ 'active': view === 'catalog' }"
        class="nav-item"
      >
        <i class="fas fa-home"></i>
        <span>Каталог</span>
      </button>

      <button 
        v-if="user"
        @click="$emit('navigate', 'my-books')" 
        :class="{ 'active': view === 'my-books' }"
        class="nav-item"
      >
        <i class="fas fa-bookmark"></i>
        <span>Мои книги</span>
      </button>

      <button 
        v-if="user"
        @click="$emit('navigate', 'favorites')" 
        :class="{ 'active': view === 'favorites' }"
        class="nav-item"
      >
        <i class="fas fa-heart"></i>
        <span>Избранное</span>
      </button>

      <div v-if="user?.role === 'admin'" class="divider"></div>

      <button 
        v-if="user?.role === 'admin'"
        @click="$emit('navigate', 'admin')" 
        :class="{ 'active': view === 'admin' }"
        class="nav-item admin"
      >
        <i class="fas fa-cog"></i>
        <span>Админ-панель</span>
      </button>
    </nav>

    <div class="user-section">
      <div v-if="user" class="user-card">
        <div class="user-info">
          <strong>{{ user.login }}</strong>
          <small>{{ user.role === 'admin' ? '👨‍💼 Админ' : '👨‍🎓 Студент' }}</small>
        </div>
        <button @click="$emit('logout')" class="btn-logout" title="Выход">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
      <div v-else>
        <button @click="$emit('navigate', 'auth')" class="btn-primary">
          Войти
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  user: Object,
  view: String
})

defineEmits(['navigate', 'logout'])
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.logo {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-menu {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  text-align: left;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #6366f1;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(249, 115, 22, 0.1));
  color: #6366f1;
}

.nav-item.admin {
  color: #ef4444;
}

.nav-item.admin.active {
  background: rgba(239, 68, 68, 0.1);
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;
}

.user-section {
  padding: 20px 12px;
  border-top: 1px solid #e5e7eb;
}

.user-card {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info strong {
  font-size: 14px;
}

.user-info small {
  font-size: 12px;
  color: #6b7280;
}

.btn-logout {
  width: 36px;
  height: 36px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-logout:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
}
</style>