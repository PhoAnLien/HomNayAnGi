// Dữ liệu món ăn (sẽ được nạp từ data.js)
const dishes = window.dishes || [];
let skippedDishes = [];

// DOM Elements
const randomBtn = document.getElementById('random-btn');
const dishResult = document.getElementById('dish-result');
const dishName = document.getElementById('dish-name');
const dishCategory = document.getElementById('dish-category');
const dishMealTime = document.getElementById('dish-meal-time');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryFilter = document.getElementById('category-filter');
const mealTimeFilter = document.getElementById('meal-time-filter');
const dishesContainer = document.getElementById('dishes-container');
const skippedDishesContainer = document.getElementById('skipped-dishes-container');
const searchSuggestions = document.getElementById('search-suggestions');
const randomFilters = document.getElementById('random-filters');
const toggleRandomFiltersBtn = document.getElementById('toggle-random-filters');
const applyRandomFiltersBtn = document.getElementById('apply-random-filters');
const randomCategoryFilters = document.getElementById('random-category-filters');
const randomMealTimeFilters = document.getElementById('random-meal-time-filters');

// Khởi tạo bộ lọc
function initFilters() {
    // Bộ lọc chính
    const categories = [...new Set(dishes.flatMap(dish => dish.type))].sort();
    const mealTimes = [...new Set(dishes.flatMap(dish => dish.mealTime))].sort();
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    mealTimes.forEach(mealTime => {
        const option = document.createElement('option');
        option.value = mealTime;
        option.textContent = mealTime;
        mealTimeFilter.appendChild(option);
    });
    
    // Bộ lọc ngẫu nhiên
    updateRandomFilters();
}

// Cập nhật bộ lọc ngẫu nhiên
function updateRandomFilters() {
    randomCategoryFilters.innerHTML = '';
    randomMealTimeFilters.innerHTML = '';
    
    const categories = [...new Set(dishes.flatMap(dish => dish.type))].sort();
    const mealTimes = [...new Set(dishes.flatMap(dish => dish.mealTime))].sort();
    
    categories.forEach(category => {
        const div = document.createElement('div');
        const id = `rc-${category.replace(/\s+/g, '-')}`;
        div.innerHTML = `
            <input type="checkbox" id="${id}" class="filter-checkbox" checked>
            <label for="${id}" class="filter-label">${category}</label>
        `;
        randomCategoryFilters.appendChild(div);
    });
    
    mealTimes.forEach(mealTime => {
        const div = document.createElement('div');
        const id = `rm-${mealTime.replace(/\s+/g, '-')}`;
        div.innerHTML = `
            <input type="checkbox" id="${id}" class="filter-checkbox" checked>
            <label for="${id}" class="filter-label">${mealTime}</label>
        `;
        randomMealTimeFilters.appendChild(div);
    });
}

// Lọc món ăn (chế độ thông thường)
function filterDishes() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const mealTime = mealTimeFilter.value;
    
    return dishes.filter(dish => {
        const matchesSearch = searchTerm ? 
            dish.name.toLowerCase().includes(searchTerm) : true;
        const matchesCategory = category ? 
            dish.type.includes(category) : true;
        const matchesMealTime = mealTime ? 
            dish.mealTime.includes(mealTime) : true;
        
        return matchesSearch && matchesCategory && matchesMealTime;
    });
}

// Lọc cho chế độ ngẫu nhiên
function filterForRandom() {
    const selectedCategories = [
        ...randomCategoryFilters.querySelectorAll('input:checked')
    ].map(el => el.id.replace('rc-', '').replace(/-/g, ' '));
    
    const selectedMealTimes = [
        ...randomMealTimeFilters.querySelectorAll('input:checked')
    ].map(el => el.id.replace('rm-', '').replace(/-/g, ' '));
    
    // Áp dụng cả bộ lọc chính nếu có
    const mainFiltered = filterDishes();
    
    return mainFiltered.filter(dish => {
        const matchesCategories = selectedCategories.length > 0 ? 
            dish.type.some(t => selectedCategories.includes(t)) : true;
        const matchesMealTimes = selectedMealTimes.length > 0 ? 
            dish.mealTime.some(m => selectedMealTimes.includes(m)) : true;
        
        return matchesCategories && matchesMealTimes;
    });
}

// Hiển thị danh sách món ăn
function displayDishes(dishesToShow) {
    dishesContainer.innerHTML = '';
    
    if (dishesToShow.length === 0) {
        dishesContainer.innerHTML = '<p>Không tìm thấy món ăn phù hợp</p>';
        return;
    }
    
    dishesToShow.forEach(dish => {
        const dishElement = document.createElement('div');
        dishElement.className = 'dish-item';
        dishElement.innerHTML = `
            <h3>${dish.name}</h3>
            <div>
                ${dish.type.map(t => `<span class="category">${t}</span>`).join('')}
            </div>
            <div>
                ${dish.mealTime.map(m => `<span class="meal-time">${m}</span>`).join('')}
            </div>
        `;
        
        dishElement.addEventListener('click', () => {
            skippedDishes = [];
            displayRandomDish(dish);
        });
        
        dishesContainer.appendChild(dishElement);
    });
}

// Chọn món ngẫu nhiên
function selectRandomDish() {
    const useAdvancedFilter = !randomFilters.classList.contains('hidden');
    const filteredDishes = useAdvancedFilter ? filterForRandom() : filterDishes();
    const availableDishes = filteredDishes.filter(d => !skippedDishes.includes(d));
    
    if (availableDishes.length === 0) {
        alert('Không còn món ăn phù hợp! Vui lòng thử lại với bộ lọc khác.');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableDishes.length);
    displayRandomDish(availableDishes[randomIndex]);
}

// Hiển thị món được chọn ngẫu nhiên
function displayRandomDish(dish) {
    dishName.textContent = dish.name;
    dishCategory.textContent = `Danh mục: ${dish.type.join(', ')}`;
    dishMealTime.textContent = `Bữa: ${dish.mealTime.join(', ')}`;
    
    // Xóa các nút cũ nếu có
    const oldButtons = dishResult.querySelector('.action-buttons');
    if (oldButtons) oldButtons.remove();
    
    // Tạo nút mới
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'accept-btn';
    acceptBtn.textContent = 'Chấp nhận';
    acceptBtn.addEventListener('click', () => {
        alert(`Bạn đã chọn món: ${dish.name}!`);
        dishResult.classList.add('hidden');
        skippedDishes = [];
        displaySkippedDishes();
    });
    
    const nextRandomBtn = document.createElement('button');
    nextRandomBtn.className = 'next-random-btn';
    nextRandomBtn.textContent = 'Ngẫu nhiên tiếp';
    nextRandomBtn.addEventListener('click', () => {
        skippedDishes.push(dish);
        displaySkippedDishes();
        selectRandomDish();
    });
    
    actionButtons.appendChild(acceptBtn);
    actionButtons.appendChild(nextRandomBtn);
    dishResult.appendChild(actionButtons);
    dishResult.classList.remove('hidden');
    
    // Thêm hiệu ứng
    dishResult.classList.add('celebrate');
    setTimeout(() => dishResult.classList.remove('celebrate'), 1000);
    dishResult.scrollIntoView({ behavior: 'smooth' });
}

// Hiển thị món đã bỏ qua
function displaySkippedDishes() {
    skippedDishesContainer.innerHTML = '';
    
    if (skippedDishes.length === 0) {
        skippedDishesContainer.innerHTML = '<p>Chưa có món nào bị bỏ qua</p>';
        return;
    }
    
    skippedDishes.forEach(dish => {
        const skippedElement = document.createElement('div');
        skippedElement.className = 'skipped-dish-item';
        skippedElement.innerHTML = `
            <h4>${dish.name}</h4>
            <div>${dish.type.join(', ')}</div>
            <div>${dish.mealTime.join(', ')}</div>
        `;
        skippedDishesContainer.appendChild(skippedElement);
    });
}

// Tìm kiếm gợi ý
function setupSearchSuggestions() {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length === 0) {
            searchSuggestions.style.display = 'none';
            return;
        }
        
        const suggestions = dishes
            .filter(dish => dish.name.toLowerCase().includes(searchTerm))
            .slice(0, 5);
        
        searchSuggestions.innerHTML = '';
        
        if (suggestions.length > 0) {
            suggestions.forEach(dish => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.textContent = dish.name;
                suggestion.addEventListener('click', () => {
                    searchInput.value = dish.name;
                    searchSuggestions.style.display = 'none';
                    displayDishes([dish]);
                });
                searchSuggestions.appendChild(suggestion);
            });
            searchSuggestions.style.display = 'block';
        } else {
            searchSuggestions.style.display = 'none';
        }
    });
    
    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });
}

// Khởi tạo ứng dụng
function initApp() {
    if (dishes.length === 0) {
        console.error('Không có dữ liệu món ăn');
        return;
    }
    
    initFilters();
    displayDishes(dishes);
    setupSearchSuggestions();
    
    // Sự kiện tìm kiếm
    searchBtn.addEventListener('click', () => {
        searchSuggestions.style.display = 'none';
        displayDishes(filterDishes());
    });
    
    // Sự kiện bộ lọc
    categoryFilter.addEventListener('change', () => {
        displayDishes(filterDishes());
    });
    
    mealTimeFilter.addEventListener('change', () => {
        displayDishes(filterDishes());
    });
    
    // Sự kiện chọn ngẫu nhiên
    randomBtn.addEventListener('click', () => {
        skippedDishes = [];
        selectRandomDish();
    });
    
    // Sự kiện lọc ngẫu nhiên
    toggleRandomFiltersBtn.addEventListener('click', () => {
        randomFilters.classList.toggle('hidden');
        if (!randomFilters.classList.contains('hidden')) {
            updateRandomFilters();
        }
    });
    
    applyRandomFiltersBtn.addEventListener('click', () => {
        selectRandomDish();
    });
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initApp);