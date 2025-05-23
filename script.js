document.addEventListener('DOMContentLoaded', function() {
    // Навигация по разделам
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок и секций
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Добавляем активный класс текущей ссылке и секции
            this.classList.add('active');
            const sectionId = this.getAttribute('href');
            document.querySelector(sectionId).classList.add('active');
        });
    });
    
    // Калькулятор калорий
    const calculateBtn = document.getElementById('calculate-btn');
    calculateBtn.addEventListener('click', calculateCalories);
    
    function calculateCalories() {
        // Получаем значения из формы
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value) || 25;
        const height = parseInt(document.getElementById('height').value) || 175;
        const weight = parseInt(document.getElementById('weight').value) || 70;
        const activity = parseFloat(document.getElementById('activity').value);
        const goal = document.getElementById('goal').value;
        
        // Рассчитываем базовый метаболизм (BMR)
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        
        // Учитываем активность
        let calories = Math.round(bmr * activity);
        
        // Корректируем по цели
        if (goal === 'lose') {
            calories -= 300;
        } else if (goal === 'gain') {
            calories += 300;
        }
        
        // Рассчитываем БЖУ
        const protein = Math.round((goal === 'gain' ? 2.2 : 1.8) * weight);
        const fat = Math.round(0.8 * weight);
        const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
        
        // Показываем результаты
        document.getElementById('calories-result').textContent = calories;
        document.getElementById('protein-result').textContent = protein + 'г';
        document.getElementById('fat-result').textContent = fat + 'г';
        document.getElementById('carbs-result').textContent = carbs + 'г';
        
        document.getElementById('result').classList.remove('hidden');
    }
    
    // Дневник питания по дням
    let currentDate = new Date();
    let foodDiary = JSON.parse(localStorage.getItem('foodDiary')) || {};
    
    // Инициализация дневника
    initDiary();
    
    function initDiary() {
        updateDateDisplay();
        renderFoodItems();
        
        // Кнопки навигации по датам
        document.getElementById('prev-day').addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateDateDisplay();
            renderFoodItems();
        });
        
        document.getElementById('next-day').addEventListener('click', () => {
            const tomorrow = new Date(currentDate);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Не позволяем перейти на будущие даты
            if (tomorrow > new Date()) return;
            
            currentDate = tomorrow;
            updateDateDisplay();
            renderFoodItems();
        });
        
        // Модальное окно добавления еды
        const modal = document.getElementById('food-modal');
        const addFoodBtn = document.getElementById('add-food-btn');
        const closeModal = document.querySelector('.close-modal');
        const saveFoodBtn = document.getElementById('save-food-btn');
        
        addFoodBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
        
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        saveFoodBtn.addEventListener('click', saveFoodItem);
    }
    
    function updateDateDisplay() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        if (currentDate.toDateString() === today.toDateString()) {
            document.getElementById('current-date').textContent = 'Сегодня';
        } else if (
            currentDate.getDate() === today.getDate() - 1 && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear()
        ) {
            document.getElementById('current-date').textContent = 'Вчера';
        } else {
            document.getElementById('current-date').textContent = 
                currentDate.toLocaleDateString('ru-RU', options);
        }
    }
    
    function saveFoodItem() {
        const name = document.getElementById('modal-food-name').value.trim();
        const calories = parseInt(document.getElementById('modal-food-calories').value) || 0;
        const protein = parseFloat(document.getElementById('modal-food-protein').value) || 0;
        const fat = parseFloat(document.getElementById('modal-food-fat').value) || 0;
        const carbs = parseFloat(document.getElementById('modal-food-carbs').value) || 0;
        
        if (!name) {
            alert('Пожалуйста, укажите название продукта');
            return;
        }
        
        const dateKey = formatDateKey(currentDate);
        const newItem = {
            id: Date.now(),
            name: name,
            calories: calories,
            protein: protein,
            fat: fat,
            carbs: carbs
        };
        
        // Добавляем запись в дневник
        if (!foodDiary[dateKey]) {
            foodDiary[dateKey] = [];
        }
        
        foodDiary[dateKey].push(newItem);
        saveDiary();
        renderFoodItems();
        
        // Очищаем форму и закрываем модальное окно
        document.getElementById('modal-food-name').value = '';
        document.getElementById('modal-food-calories').value = '';
        document.getElementById('modal-food-protein').value = '';
        document.getElementById('modal-food-fat').value = '';
        document.getElementById('modal-food-carbs').value = '';
        
        document.getElementById('food-modal').classList.add('hidden');
    }
    
    function renderFoodItems() {
        const dateKey = formatDateKey(currentDate);
        const itemsContainer = document.getElementById('food-items');
        itemsContainer.innerHTML = '';
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        
        if (foodDiary[dateKey] && foodDiary[dateKey].length > 0) {
            foodDiary[dateKey].forEach(item => {
                totalCalories += item.calories;
                totalProtein += item.protein;
                totalFat += item.fat;
                totalCarbs += item.carbs;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'food-item';
                itemElement.innerHTML = `
                    <span>${item.name}</span>
                    <span>${item.calories}</span>
                    <span>${item.protein.toFixed(1)}г</span>
                    <span>${item.fat.toFixed(1)}г</span>
                    <span>${item.carbs.toFixed(1)}г</span>
                    <button class="delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                itemsContainer.appendChild(itemElement);
            });
            
            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    deleteFoodItem(id);
                });
            });
        } else {
            itemsContainer.innerHTML = '<div class="no-items">Нет записей за этот день</div>';
        }
        
        // Обновляем итоговые значения
        document.getElementById('total-calories').textContent = totalCalories;
        document.getElementById('total-protein').textContent = totalProtein.toFixed(1) + 'г';
        document.getElementById('total-fat').textContent = totalFat.toFixed(1) + 'г';
        document.getElementById('total-carbs').textContent = totalCarbs.toFixed(1) + 'г';
    }
    
    function deleteFoodItem(id) {
        const dateKey = formatDateKey(currentDate);
        
        if (foodDiary[dateKey]) {
            foodDiary[dateKey] = foodDiary[dateKey].filter(item => item.id !== id);
            saveDiary();
            renderFoodItems();
        }
    }
    
    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    function saveDiary() {
        localStorage.setItem('foodDiary', JSON.stringify(foodDiary));
    }
    
    // Таймер тренировок
    let timer;
    let seconds = 0;
    let isRunning = false;
    let todayWorkoutSeconds = 0;
    let totalWorkoutSeconds = parseInt(localStorage.getItem('totalWorkoutSeconds')) || 0;
    
    // Загрузка сохраненного времени таймера
    const savedTimer = localStorage.getItem('workoutTimer');
    if (savedTimer) {
        const { savedSeconds, savedDate } = JSON.parse(savedTimer);
        const today = new Date().toDateString();
        
        if (savedDate === today) {
            seconds = savedSeconds;
        }
    }
    
    // Инициализация таймера
    initTimer();
    
    function initTimer() {
        updateTimerDisplay();
        
        // Кнопки управления таймером
        document.getElementById('start-timer').addEventListener('click', startTimer);
        document.getElementById('pause-timer').addEventListener('click', pauseTimer);
        document.getElementById('reset-timer').addEventListener('click', resetTimer);
        
        // Обновление статистики
        updateWorkoutStats();
    }
    
    function startTimer() {
        if (!isRunning) {
            timer = setInterval(() => {
                seconds++;
                todayWorkoutSeconds++;
                totalWorkoutSeconds++;
                
                updateTimerDisplay();
                saveTimerState();
                
                // Каждую минуту сохраняем общее время тренировок
                if (seconds % 60 === 0) {
                    localStorage.setItem('totalWorkoutSeconds', totalWorkoutSeconds.toString());
                    updateWorkoutStats();
                }
            }, 1000);
            isRunning = true;
        }
    }
    
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        saveTimerState();
    }
    
    function resetTimer() {
        pauseTimer();
        seconds = 0;
        updateTimerDisplay();
        saveTimerState();
    }
    
    function updateTimerDisplay() {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        document.getElementById('timer-display').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function saveTimerState() {
        const timerState = {
            savedSeconds: seconds,
            savedDate: new Date().toDateString()
        };
        localStorage.setItem('workoutTimer', JSON.stringify(timerState));
    }
    
    function updateWorkoutStats() {
        // Сегодняшнее время тренировки
        const todayHours = Math.floor(todayWorkoutSeconds / 3600);
        const todayMinutes = Math.floor((todayWorkoutSeconds % 3600) / 60);
        const todaySecs = todayWorkoutSeconds % 60;
        
        document.getElementById('today-workout').textContent = 
            `${todayHours.toString().padStart(2, '0')}:${todayMinutes.toString().padStart(2, '0')}:${todaySecs.toString().padStart(2, '0')}`;
        
        // Общее время тренировки
        const totalHours = Math.floor(totalWorkoutSeconds / 3600);
        const totalMinutes = Math.floor((totalWorkoutSeconds % 3600) / 60);
        const totalSecs = totalWorkoutSeconds % 60;
        
        document.getElementById('total-workout').textContent = 
            `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSecs.toString().padStart(2, '0')}`;
    }
    
    // История тренировок
    function loadWorkoutHistory() {
        // Здесь можно добавить загрузку истории тренировок
        // Пока просто заглушка
        document.getElementById('workout-history').innerHTML = `
            <div class="history-item">
                <span>Сегодня</span>
                <span>${formatTime(todayWorkoutSeconds)}</span>
            </div>
            <div class="history-item">
                <span>Всего</span>
                <span>${formatTime(totalWorkoutSeconds)}</span>
            </div>
        `;
    }
    
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours}ч ${minutes}м ${seconds}с`;
    }
    
    // Загружаем историю при старте
    loadWorkoutHistory();
});