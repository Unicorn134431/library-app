<template>
  <div class="home-container">
    <div class="home-content">
      <h1 class="home-title">PRO+ LIB</h1>
      <p class="home-subtitle">Премиум библиотека знаний</p>
      <p class="home-description">Откройте мир литературы. Более 40 книг по IT, дизайну, науке и классической прозе</p>
      
      <div class="home-buttons">
        <button @click="goToAuth" class="btn-primary">
          <i class="fas fa-sign-in-alt"></i> Войти
        </button>
        <button @click="$emit('navigate', 'catalog')" class="btn-secondary">
          <i class="fas fa-book-open"></i> Обзор без входа
        </button>
      </div>

      <div class="features">
        <div class="feature-item">
          <i class="fas fa-book"></i>
          <h3>40+ книг</h3>
          <p>Большая коллекция</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-star"></i>
          <h3>Рейтинги</h3>
          <p>От пользователей</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-heart"></i>
          <h3>Избранное</h3>
          <p>Сохраняйте книги</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['navigate'])

const goToAuth = () => {
  emit('navigate', 'auth')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.home-content {
  text-align: center;
  max-width: 900px;
}

.home-title {
  font-size: 64px;
  font-weight: 900;
  background: linear-gradient(135deg, #818cf8 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  font-family: 'Playfair Display', serif;
  letter-spacing: -2px;
}

.home-subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
  font-weight: 600;
  font-family: 'Playfair Display', serif;
}

.home-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 48px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

.home-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 80px;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 60px;
}

.feature-item {
  color: white;
}

.feature-item i {
  font-size: 40px;
  color: #818cf8;
  margin-bottom: 12px;
  display: block;
}

.feature-item h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  font-family: 'Playfair Display', serif;
}

.feature-item p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Inter', sans-serif;
}

@media (max-width: 768px) {
  .home-title {
    font-size: 40px;
  }

  .home-subtitle {
    font-size: 20px;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>