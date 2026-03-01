<template>
  <div class="auth-lamp-container">
    <div class="lamp-scene">
      <!-- ОСНОВАНИЕ ТОРШЕРА -->
      <div class="lamp-base"></div>

      <!-- НОЖКА ТОРШЕРА -->
      <div class="lamp-pole"></div>

      <!-- АБАЖУР ТОРШЕРА -->
      <div class="lamp-shade" :class="{ 'lamp-on': lampOn }"></div>

      <!-- СВЕТ ТОРШЕРА -->
      <div v-if="lampOn" class="lamp-light"></div>

      <!-- ШНУР ВЫКЛЮЧАТЕЛЯ -->
      <div class="lamp-switch-container">
        <div class="cord-line" :style="{ height: cordHeight + 'px' }"></div>
        <div class="cord-ball" @click="toggleLamp"></div>
      </div>

      <!-- ИНСТРУКЦИЯ -->
      <div class="lamp-instruction">
        <p v-if="!lampOn">✨ Потяните за выключатель ✨</p>
        <p v-else class="light-on">💡 Свет включен!</p>
      </div>
    </div>

    <!-- ФОРМА АВТОРИЗАЦИИ (ПОЯВЛЯЕТСЯ ПОСЛЕ ВКЛЮЧЕНИЯ СВЕТА) -->
    <transition name="fade">
      <div v-if="lampOn" class="auth-form-container">
        <button class="close-auth" @click="$emit('navigate', 'home')">
          <i class="fas fa-times"></i>
        </button>

        <div class="auth-header">
          <h1 class="auth-title">PRO+ LIB</h1>
          <p class="auth-subtitle">Добро пожаловать в премиум библиотеку</p>
        </div>

        <div class="auth-tabs">
          <button 
            @click="mode = 'login'" 
            :class="{ 'active': mode === 'login' }"
            class="auth-tab"
          >
            <i class="fas fa-sign-in-alt"></i> Вход
          </button>
          <button 
            @click="mode = 'register'" 
            :class="{ 'active': mode === 'register' }"
            class="auth-tab"
          >
            <i class="fas fa-user-plus"></i> Регистрация
          </button>
        </div>

        <form @submit.prevent="handleAuth" class="auth-form">
          <div class="form-group">
            <label>Логин</label>
            <input 
              v-model="form.login" 
              placeholder="Введите логин" 
              required
            >
          </div>

          <div v-if="mode === 'register'" class="form-group">
            <label>Email</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="Введите email" 
              required
            >
          </div>

          <div v-if="mode === 'register'" class="form-group">
            <label>Полное имя</label>
            <input 
              v-model="form.full_name" 
              placeholder="Введите имя"
            >
          </div>

          <div class="form-group">
            <label>Пароль</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="Введите пароль" 
              required
            >
          </div>

          <button type="submit" class="btn-auth" :disabled="loading">
            {{ loading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Создать аккаунт') }}
          </button>
        </form>

        <div v-if="error" class="auth-error">
          <i class="fas fa-exclamation-circle"></i> {{ error }}
        </div>

        <p class="auth-footer">
          Тестовый аккаунт: <strong>admin / 123456</strong>
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const mode = ref('login')
const form = ref({ login: '', email: '', password: '', full_name: '' })
const error = ref('')
const loading = ref(false)
const lampOn = ref(false)
const cordHeight = ref(150)
const emit = defineEmits(['login', 'navigate'])

const toggleLamp = () => {
  if (cordHeight.value === 150) {
    cordHeight.value = 250
    setTimeout(() => {
      cordHeight.value = 150
      lampOn.value = true
    }, 300)
  } else {
    lampOn.value = false
    cordHeight.value = 150
  }
}

const API_URL = import.meta.env.VITE_API_URL  // <-- берём из .env

const handleAuth = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const endpoint = mode.value === 'login'
      ? '/auth/login'
      : '/auth/register'

    const response = await axios.post(
      `${API_URL}${endpoint}`,
      form.value
    )
    
    localStorage.setItem('token', response.data.token)
    emit('login', response.data.user)

  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка при авторизации'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-lamp-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 40px;
}

.lamp-scene {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ОСНОВАНИЕ ТОРШЕРА */
.lamp-base {
  position: absolute;
  bottom: 20px;
  width: 180px;
  height: 40px;
  background: linear-gradient(135deg, #d4af37 0%, #c9a961 100%);
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3), inset -2px -2px 8px rgba(0,0,0,0.2);
}

.lamp-base::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 6px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
  border-radius: 3px;
}

/* НОЖКА ТОРШЕРА */
.lamp-pole {
  position: absolute;
  bottom: 60px;
  width: 16px;
  height: 280px;
  background: linear-gradient(90deg, #c0a080 0%, #e8d5c4 50%, #c0a080 100%);
  border-radius: 8px;
  box-shadow: 
    -3px 0 8px rgba(0,0,0,0.2),
    3px 0 8px rgba(255,255,255,0.1),
    inset -1px 0 2px rgba(0,0,0,0.1),
    inset 1px 0 2px rgba(255,255,255,0.2);
}

/* АБАЖУР ТОРШЕРА */
.lamp-shade {
  position: absolute;
  bottom: 340px;
  width: 200px;
  height: 120px;
  background: linear-gradient(135deg, #faf9f6 0%, #f5f3f0 100%);
  border-radius: 50% 50% 45% 45%;
  box-shadow: 
    0 -8px 20px rgba(0,0,0,0.15),
    inset -10px -10px 20px rgba(0,0,0,0.08),
    inset 10px 10px 20px rgba(255,255,255,0.6);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lamp-shade.lamp-on {
  box-shadow: 
    0 -8px 40px rgba(249, 115, 22, 0.6),
    inset -10px -10px 20px rgba(0,0,0,0.08),
    inset 10px 10px 20px rgba(255,255,255,0.8);
  background: linear-gradient(135deg, #fef3e2 0%, #fef9f3 100%);
}

/* СВЕТ ОТ ТОРШЕРА */
.lamp-light {
  position: absolute;
  bottom: 340px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(249, 115, 22, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: lamp-glow 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes lamp-glow {
  0%, 100% { 
    opacity: 0.8;
    filter: blur(20px);
  }
  50% { 
    opacity: 1;
    filter: blur(30px);
  }
}

/* ШНУР ВЫКЛЮЧАТЕЛЯ */
.lamp-switch-container {
  position: absolute;
  top: 180px;
  right: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.cord-line {
  width: 4px;
  background: linear-gradient(180deg, #b8860b 0%, #d4af37 100%);
  margin-bottom: 4px;
  transition: height 0.3s ease;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
}

.cord-ball {
  width: 36px;
  height: 36px;
  background: radial-gradient(circle at 30% 30%, #ffd700, #d4af37);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(212, 175, 55, 0.5),
    inset -2px -2px 6px rgba(0,0,0,0.2),
    inset 2px 2px 6px rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.cord-ball:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 16px rgba(212, 175, 55, 0.7),
    inset -2px -2px 6px rgba(0,0,0,0.2),
    inset 2px 2px 6px rgba(255,255,255,0.4);
}

.cord-ball:active {
  transform: scale(0.95);
}

/* ИНСТРУКЦИЯ */
.lamp-instruction {
  position: absolute;
  top: 40px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  min-height: 24px;
}

.lamp-instruction p {
  animation: fade-bounce 1s ease-in-out infinite;
}

.lamp-instruction .light-on {
  color: #f97316;
  animation: fade-in 0.6s ease-out;
}

@keyframes fade-bounce {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ФОРМА АВТОРИЗАЦИИ */
.auth-form-container {
  position: absolute;
  right: -450px;
  top: 50%;
  transform: translateY(-50%);
  width: 420px;
  background: white;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slide-in-right 0.6s ease-out forwards;
}

@keyframes slide-in-right {
  from {
    right: -450px;
    opacity: 0;
  }
  to {
    right: 40px;
    opacity: 1;
  }
}

.close-auth {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: #111827;
  transition: all 0.3s;
}

.close-auth:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.auth-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
}

.auth-tab {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.auth-tab.active {
  background: white;
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-auth {
  padding: 14px 20px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
}

.btn-auth:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.btn-auth:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-footer {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
}

.auth-footer strong {
  color: #6366f1;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .auth-form-container {
    position: fixed;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
    animation: slide-up 0.6s ease-out forwards;
  }

  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .lamp-scene {
    display: none;
  }
}
</style>