document.addEventListener("DOMContentLoaded", function () {
    // ==============================
    // ПРЕЛОАДЕР
    // ==============================
    
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Скрываем прелоадер когда DOM готов + небольшая задержка для плавности
        setTimeout(function() {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 500);
        }, 2000); 
    }


    document.querySelectorAll('.tile').forEach(tile => observer.observe(tile));
      // ==============================
    // ПРОГРЕСС
    // ==============================
    
    const progressBar = document.getElementById('progressBar');
    let rafId = null;
    
    function updateProgressBar() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollPosition = window.scrollY;
            const scrollPercentage = (scrollPosition / documentHeight) * 100;
            
            progressBar.style.width = Math.min(100, Math.max(0, scrollPercentage)) + '%';
        });
    }
    
    window.addEventListener('scroll', updateProgressBar, { passive: true });
    window.addEventListener('resize', updateProgressBar);
    updateProgressBar();
    // ==============================
    // МОБИЛЬНОЕ МЕНЮ - ОСНОВНОЙ ФУНКЦИОНАЛ
    // ==============================
    
    const burger = document.querySelector('.burger_media');
    const menu = document.querySelector("#mobileMenu");
    const overlay = document.querySelector("#menuOverlay");

    // Функция сброса всех подменю
    function resetAllSubmenus() {
        document.querySelectorAll('#mobileMenu .submenu').forEach(submenu => {
            submenu.classList.remove('active');
        });
    }

    // Функция закрытия меню
    function closeMenu() {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        resetAllSubmenus();
    }

    // Бургер меню - открытие/закрытие
    if (burger && menu) {
        burger.addEventListener("click", () => {
            const isOpening = !menu.classList.contains("open");
            menu.classList.toggle("open");
            if (overlay) overlay.classList.toggle("active");
            document.body.style.overflow = isOpening ? "hidden" : "";
            
            // Сбрасываем все подменю при открытии основного меню
            if (isOpening) {
                resetAllSubmenus();
            }
        });
    }

    // Закрытие меню по клику на оверлей
    if (overlay) {
        overlay.addEventListener("click", closeMenu);
    }

    // ==============================
    // ОБРАБОТКА ПОДМЕНЮ В МОБИЛЬНОМ МЕНЮ
    // ==============================
    
    // Обработчики для ВСЕХ пунктов с подменю (включая вложенные)
    document.querySelectorAll('#mobileMenu .has-submenu').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Clicked submenu item:', this.textContent);
                
                // Находим подменю (следующий элемент после ссылки)
                const submenu = this.nextElementSibling;
                
                if (submenu && submenu.classList.contains('submenu')) {
                    console.log('Opening submenu');
                    submenu.classList.add('active');
                } else {
                    console.log('Submenu not found or wrong class');
                }
            }
        });
    });

    // Обработчики для кнопок "Назад"
    document.querySelectorAll('#mobileMenu .menu-back-mobile a').forEach(backLink => {
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Back button clicked');
            
            // Закрываем текущее подменю
            const submenu = this.closest('.submenu');
            if (submenu) {
                submenu.classList.remove('active');
            }
        });
    });

    // Обычные ссылки (без подменю) - закрывают меню
    document.querySelectorAll('#mobileMenu a:not(.has-submenu)').forEach(link => {
        // Пропускаем кнопки "Назад"
        if (!link.closest('.menu-back-mobile')) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    console.log('Regular link clicked, closing menu');
                    closeMenu();
                }
            });
        }
    });

    // Закрытие меню по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu && menu.classList.contains('open')) {
            closeMenu();
        }
    });

    // ==============================
    // СОЦИАЛЬНЫЕ КНОПКИ
    // ==============================
    
    const toggleButton = document.querySelector('.chat-toggle');
    const socialPanel = document.querySelector('.social');
    
    if (toggleButton && socialPanel) {
        toggleButton.addEventListener('click', function () {
            socialPanel.classList.toggle('active');
            toggleButton.classList.toggle('active');
        });
    }

    // ==============================
    // СЛАЙДЕР ИЗОБРАЖЕНИЙ
    // ==============================
    
   const slides = document.querySelector(".slides");
const radios = document.querySelectorAll('input[name="r"]');

if (slides && radios.length > 0) {
    let startX = 0;
    let endX = 0;
    let currentIndex = 0;
    let counter = 1; // Выносим counter в общую область видимости
    const slideCount = 4;

    const updateIndex = () => {
        if (radios[currentIndex]) {
            radios[currentIndex].checked = true;
            counter = currentIndex + 1; // Синхронизируем counter с currentIndex
        }
    };

    // Обработка свайпов
    slides.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    slides.addEventListener("touchend", (e) => {
        endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) {
            // swipe left
            currentIndex = Math.min(currentIndex + 1, radios.length - 1);
            updateIndex();
        } else if (endX - startX > 50) {
            // swipe right
            currentIndex = Math.max(currentIndex - 1, 0);
            updateIndex();
        }
    });

    // Синхронизация текущего индекса
    radios.forEach((radio, i) => {
        if (radio.checked) {
            currentIndex = i;
            counter = i + 1; // Синхронизируем при загрузке страницы
        }
        radio.addEventListener("change", () => {
            currentIndex = i;
            counter = i + 1; // Синхронизируем при ручном переключении
        });
    });

    // Автопереключение слайдов
    setInterval(() => {
        currentIndex = (currentIndex + 1) % slideCount; // Используем currentIndex вместо counter
        if (radios[currentIndex]) {
            radios[currentIndex].checked = true;
            counter = currentIndex + 1; // Поддерживаем синхронизацию
        }
    }, 10000);
}
// ==============================
// БЛОК ФИЛЬТР (шторка) - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ==============================

const drawer = document.getElementById('filterDrawer');
const handle = document.getElementById('filterHandle');
const closeFilter = document.getElementById('closeFilter');
const applyFilter = document.getElementById('applyFilter');
const resetFilter = document.getElementById('resetFilter');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const sliderRange = document.getElementById('sliderRange');
const productsContainer = document.getElementById('productsContainer');
const productsCount = document.getElementById('productsCount');
// Получаем реальные цены
function getRealPriceRange() {
    const realMinPrice = parseInt(minRange?.getAttribute('min')) || 0;
    const realMaxPrice = parseInt(maxRange?.getAttribute('max')) || 50000;
    
    return {
        min: realMinPrice,
        max: realMaxPrice
    };
}
// Обновление визуальной полосы
function updateSliderRange() {
    if (!sliderRange) return;
    
    const priceRange = getRealPriceRange();
    const minVal = parseInt(minRange.value);
    const maxVal = parseInt(maxRange.value);
    const totalRange = priceRange.max - priceRange.min;
    
    // Защита от деления на ноль
    if (totalRange === 0) {
        sliderRange.style.left = "0%";
        sliderRange.style.width = "100%";
        return;
    }
    
    // Расчет в процентах
    const minPercent = ((minVal - priceRange.min) / totalRange) * 100;
    const maxPercent = ((maxVal - priceRange.min) / totalRange) * 100;
    
    // Устанавливаем позицию и ширину
    sliderRange.style.left = minPercent + "%";
    sliderRange.style.width = (maxPercent - minPercent) + "%";
    
    console.log(`Slider range: left=${minPercent}%, width=${maxPercent - minPercent}%`);
}
// Обновление минимального значения
function updateMinPrice() {
    const priceRange = getRealPriceRange();
    let minVal = parseInt(minRange.value);
    let maxVal = parseInt(maxRange.value);
    
    // Ограничения
    minVal = Math.max(priceRange.min, minVal);
    minVal = Math.min(maxVal, minVal);
    
    minRange.value = minVal;
    minPriceInput.value = minVal;
    updateSliderRange();
}
// Обновление максимального значения
function updateMaxPrice() {
    const priceRange = getRealPriceRange();
    let minVal = parseInt(minRange.value);
    let maxVal = parseInt(maxRange.value);
    
    // Ограничения
    maxVal = Math.min(priceRange.max, maxVal);
    maxVal = Math.max(minVal, maxVal);
    
    maxRange.value = maxVal;
    maxPriceInput.value = maxVal;
    updateSliderRange();
}

// Обновление при вводе в поле "От"
function updateMinRange() {
    const priceRange = getRealPriceRange();
    let minVal = parseInt(minPriceInput.value) || priceRange.min;
    const maxVal = parseInt(maxRange.value);
    
    // Валидация
    if (isNaN(minVal)) minVal = priceRange.min;
    minVal = Math.max(priceRange.min, minVal);
    minVal = Math.min(priceRange.max, minVal);
    minVal = Math.min(maxVal, minVal);
    
    minRange.value = minVal;
    minPriceInput.value = minVal;
    updateSliderRange();
}

// Обновление при вводе в поле "До"
function updateMaxRange() {
    const priceRange = getRealPriceRange();
    const minVal = parseInt(minRange.value);
    let maxVal = parseInt(maxPriceInput.value) || priceRange.max;
    
    // Валидация
    if (isNaN(maxVal)) maxVal = priceRange.max;
    maxVal = Math.min(priceRange.max, maxVal);
    maxVal = Math.max(priceRange.min, maxVal);
    maxVal = Math.max(minVal, maxVal);
    
    maxRange.value = maxVal;
    maxPriceInput.value = maxVal;
    updateSliderRange();
}
// ====================
// ФИЛЬТРАЦИЯ
// ====================


// Сброс фильтров (тоже без перезагрузки)
function resetFilters() {
    const priceRange = getRealPriceRange();
    
    // Сбрасываем значения
    minPriceInput.value = '';
    maxPriceInput.value = '';
    minRange.value = priceRange.min;
    maxRange.value = priceRange.max;
    updateSliderRange();
    
    // Очищаем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('min_price');
    urlParams.delete('max_price');
    urlParams.delete('page');
    
    // Обновляем URL
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    history.pushState({}, '', newUrl);
    
    // Вызываем фильтрацию с пустыми параметрами
    applyPriceFilters();
}
// ====================
// ФИЛЬТР ПО СОСТАВУ (МАТЕРИАЛУ)
// ====================

// Функция для поиска по составу
function initCompositionSearch() {
    const compositionSearch = document.getElementById('compositionSearch');
    const compositionOptions = document.querySelectorAll('.composition-option');
    
    if (!compositionSearch || !compositionOptions.length) return;
    
    compositionSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        compositionOptions.forEach(option => {
            const compositionName = option.querySelector('.composition-name').textContent.toLowerCase();
            if (compositionName.includes(searchTerm)) {
                option.style.display = 'flex';
            } else {
                option.style.display = 'none';
            }
        });
    });
}

// В функции applyPriceFilters обновляем сбор данных:
// НАЙДИТЕ функцию applyPriceFilters и ОБНОВИТЕ её:

function applyPriceFilters(e) {
    if (e) e.preventDefault();
    
    const minPrice = minPriceInput.value || minRange.min;
    const maxPrice = maxPriceInput.value || maxRange.max;
    
    // Собираем выбранные составы (ДОБАВЛЯЕМ ЭТО)
    const selectedCompositions = Array.from(document.querySelectorAll('.composition-checkbox:checked'))
        .map(cb => cb.value);
    
    // Проверка значений
    if (parseInt(minPrice) > parseInt(maxPrice)) {
        alert('Минимальная цена не может быть больше максимальной');
        return;
    }
    
    // Показываем индикатор загрузки
    if (productsContainer) {
        productsContainer.classList.add('loading');
        productsContainer.innerHTML = '<div class="loading-spinner">Загрузка...</div>';
    }
    
    // Собираем ВСЕ параметры фильтрации (не только цену)
    const urlParams = new URLSearchParams(window.location.search);
    const filterData = {};
    
    // 1. Цена
    if (minPrice && parseInt(minPrice) > parseInt(minRange.min)) {
        filterData.min_price = minPrice;
        urlParams.set('min_price', minPrice);
    } else {
        urlParams.delete('min_price');
    }
    
    if (maxPrice && parseInt(maxPrice) < parseInt(maxRange.max)) {
        filterData.max_price = maxPrice;
        urlParams.set('max_price', maxPrice);
    } else {
        urlParams.delete('max_price');
    }
    
    // 2. Составы (ДОБАВЛЯЕМ ЭТО)
    if (selectedCompositions.length > 0) {
        filterData.compositions = selectedCompositions;
        urlParams.delete('composition');
        selectedCompositions.forEach(comp => {
            urlParams.append('composition', comp);
        });
    } else {
        urlParams.delete('composition');
        delete filterData.compositions;
    }
    
    // 3. Категория (если есть)
    const category = urlParams.get('category') || 
                    document.querySelector('[name="category"]')?.value;
    if (category) filterData.category = category;
    
    // 4. Поиск (если есть)
    const searchQuery = urlParams.get('search') || 
                       document.querySelector('[name="search"]')?.value;
    if (searchQuery) filterData.search = searchQuery;
    
    // 5. Название товара (если есть)
    const name = urlParams.get('name');
    if (name) filterData.name = name;
    
    // Обновляем URL без перезагрузки (history API)
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    history.pushState({}, '', newUrl);
    
    // AJAX запрос
    fetch('/catalog/filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(filterData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success && productsContainer) {
            // Обновляем товары
            productsContainer.innerHTML = data.products_html || '<p>Товары не найдены</p>';
            
            // Обновляем счетчик
            if (productsCount) {
                productsCount.textContent = 'Найдено товаров: ' + (data.products_count || 0);
            }
            
            // Обновляем список составов, если он пришел с сервера
            if (data.compositions && data.compositions.length > 0) {
                updateCompositionFilter(data.compositions);
            }
            
            // Обновляем заголовок страницы (опционально)
            if (data.products_count !== undefined) {
                document.title = `Каталог (${data.products_count} товаров)`;
            }
        } else {
            console.error('Filter error:', data.message || 'Unknown error');
            if (productsContainer) {
                productsContainer.innerHTML = '<p class="error">Ошибка при загрузке товаров</p>';
            }
        }
    })
    .catch(error => {
        console.error('Filter fetch error:', error);
        
        // Fallback: показываем сообщение и предлагаем перезагрузить
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="error-message">
                    <p>Произошла ошибка при фильтрации</p>
                    <button onclick="location.reload()" class="reload-btn">Обновить страницу</button>
                </div>
            `;
        }
    })
    .finally(() => {
        // Убираем индикатор загрузки
        if (productsContainer) {
            productsContainer.classList.remove('loading');
        }
    });
}

// Функция обновления фильтра составов (если список изменился)
function updateCompositionFilter(compositions) {
    const compositionFilter = document.getElementById('compositionFilter');
    if (!compositionFilter) return;
    
    // Сохраняем выбранные элементы
    const selectedCompositions = Array.from(document.querySelectorAll('.composition-checkbox:checked'))
        .map(cb => cb.value);
    
    // Очищаем текущий список
    compositionFilter.innerHTML = '';
    
    // Добавляем новые элементы
    if (compositions.length === 0) {
        compositionFilter.innerHTML = '<p class="no-compositions">Состав не указан</p>';
        return;
    }
    
    compositions.forEach((comp, index) => {
        const isChecked = selectedCompositions.includes(comp.name || comp);
        const compName = comp.name || comp;
        
        const option = document.createElement('div');
        option.className = 'composition-option';
        option.innerHTML = `
            <input type="checkbox" 
                   id="composition_${index}" 
                   name="composition" 
                   value="${compName}"
                   class="composition-checkbox" ${isChecked ? 'checked' : ''}>
            <label for="composition_${index}" class="composition-label">
                <span class="checkbox-custom"></span>
                <span class="composition-name">${compName}</span>
            </label>
        `;
        compositionFilter.appendChild(option);
    });
    
    // Переинициализируем поиск
    initCompositionSearch();
}

// В функции resetFilters добавляем сброс составов:
// НАЙДИТЕ функцию resetFilters и ДОБАВЬТЕ в неё:

function resetFilters() {
    const priceRange = getRealPriceRange();
    
    // Сбрасываем значения цены
    minPriceInput.value = '';
    maxPriceInput.value = '';
    minRange.value = priceRange.min;
    maxRange.value = priceRange.max;
    
    // Сбрасываем составы (ДОБАВЛЯЕМ ЭТО)
    document.querySelectorAll('.composition-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    updateSliderRange();
    
    // Очищаем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('min_price');
    urlParams.delete('max_price');
    urlParams.delete('composition');
    urlParams.delete('page');
    
    // Обновляем URL
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    history.pushState({}, '', newUrl);
    
    // Вызываем фильтрацию с пустыми параметрами
    applyPriceFilters();
}
// ====================
// УПРАВЛЕНИЕ ШТОРКОЙ
// ====================

function openFilter() {
    drawer.classList.add('open');
    handle.classList.add('open');
}

function closeFilterDrawer() {
    drawer.classList.remove('open');
    handle.classList.remove('open');
}

// ====================
// ИНИЦИАЛИЗАЦИЯ
// ====================

function initPriceFilter() {
    const priceRange = getRealPriceRange();
    
    // Значения из URL
    const urlParams = new URLSearchParams(window.location.search);
    const minPriceFromUrl = urlParams.get('min_price');
    const maxPriceFromUrl = urlParams.get('max_price');
    
    // Минимальная цена
    let minVal = priceRange.min;
    if (minPriceFromUrl) {
        minVal = Math.max(priceRange.min, Math.min(priceRange.max, parseInt(minPriceFromUrl)));
    }
    minPriceInput.value = minVal;
    minRange.value = minVal;
    
    // Максимальная цена
    let maxVal = priceRange.max;
    if (maxPriceFromUrl) {
        maxVal = Math.max(priceRange.min, Math.min(priceRange.max, parseInt(maxPriceFromUrl)));
        maxVal = Math.max(minVal, maxVal); // Не меньше минимума
    }
    maxPriceInput.value = maxVal;
    maxRange.value = maxVal;
    
    updateSliderRange();
}

function initFilter() {
    if (!drawer) return;
    
    initPriceFilter();
    
    // Обработчики для ползунков
    minRange.addEventListener('input', updateMinPrice);
    maxRange.addEventListener('input', updateMaxPrice);
    minRange.addEventListener('change', applyPriceFilters);
    maxRange.addEventListener('change', applyPriceFilters);
    
    // Обработчики для полей ввода
    minPriceInput.addEventListener('change', updateMinRange);
    maxPriceInput.addEventListener('change', updateMaxRange);
    minPriceInput.addEventListener('blur', updateMinRange);
    maxPriceInput.addEventListener('blur', updateMaxRange);
    
    // Кнопки
    applyFilter.addEventListener('click', applyPriceFilters);
    resetFilter.addEventListener('click', resetFilters);
    handle.addEventListener('click', openFilter);
    closeFilter.addEventListener('click', closeFilterDrawer);
    
    // Закрытие по клику вне области
    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('open') && 
            !drawer.contains(e.target) && 
            !handle.contains(e.target)) {
            closeFilterDrawer();
        }
    });
    document.querySelectorAll('.composition-checkbox').forEach(cb => {
        cb.addEventListener('change', applyPriceFilters);
    });
}

// Свайпы для фильтра
function initFilterSwipe() {
    if (!handle) return;
    
    let startY = null;
    let isSwiping = false;

    // Начало касания
    handle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isSwiping = true;
        e.preventDefault();
    }, { passive: false });

    // Движение пальцем
    handle.addEventListener('touchmove', (e) => {
        if (!isSwiping || startY === null) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        // Если свайпаем по handle - предотвращаем скролл страницы
        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }

        // Свайп вниз — открыть
        if (diff > 50) {
            openFilter();
            isSwiping = false;
            startY = null;
        }

        // Свайп вверх — закрыть
        if (diff < -50) {
            closeFilterDrawer();
            isSwiping = false;
            startY = null;
        }
    }, { passive: false });

    // Конец касания
    handle.addEventListener('touchend', () => {
        isSwiping = false;
        startY = null;
    });
}
// Вызов инициализации фильтра
initFilter();
initFilterSwipe();
initCompositionSearch();
    // ==============================
    // ОБРАБОТКА УСПЕШНОГО ЗАКАЗА
    // ==============================
    
    const isSuccess = document.body.dataset.orderSuccess === "true";
    if (isSuccess) {
        setTimeout(function () {
            location.reload();
        }, 1000);
    }

    // ==============================
    // БОКОВОЕ МЕНЮ (если используется)
    // ==============================
    
    const faBars = document.querySelector('.fa-bars');
    if (faBars) {
        faBars.addEventListener("click", function (e) {
            e.preventDefault();
            const sideMenu = document.querySelector('.menu');
            const content = document.querySelector('.content');
            if (sideMenu) sideMenu.classList.toggle('menu_active');
            if (content) content.classList.toggle('content_active');
        });
    }

    // ==============================
    // ФОРМА ЗАКАЗА И ПОПАП
    // ==============================
    
    const form = document.getElementById("form");
    const toast = document.getElementById("toast");
    const popup = document.getElementById("pop_up");
    const popUpClose = document.getElementById("pop_up_close");
    const openPopUp = document.getElementById('open_pop_up');

    // Обработка отправки формы
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(form);
            
            fetch("/buy", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Закрываем попап
                    if (popup) popup.classList.remove("active");
                    
                    // Показываем тост
                    if (toast) {
                        toast.classList.add("show");
                        setTimeout(() => {
                            toast.classList.remove("show"); 
                        }, 4000); 
                    }
                    
                    // Сбрасываем форму
                    form.reset();

                    // Перезагружаем страницу если это корзина
                    if (window.location.pathname === "/cart") {
                        setTimeout(() => {
                            window.location.reload();
                        }, 400);
                    }

                } else {
                    // Обработка ошибки
                    if (toast) toast.classList.add("hidden");
                    console.log("Ошибка при отправке заказа: ", data.message);
                }
            })
            .catch(error => {
                console.error("Ошибка:", error);
                if (toast) toast.classList.add("hidden");
            });
        });
    }

    // Закрытие попапа
    if (popUpClose && popup) {
        popUpClose.addEventListener("click", () => {
            popup.classList.remove("active");
        });
    }

    // Открытие попапа
    if (openPopUp && popup) {
        openPopUp.addEventListener("click", function(e) {
            e.preventDefault();
            popup.classList.add('active');
        });
    }

    // ==============================
    // COOKIE БАННЕР И НАСТРОЙКИ
    // ==============================
    
    // Проверка наличия куки для согласия
    if (!getCookie('cookies_accepted')) {
        console.log('Cookie not found, showing banner.');
        document.getElementById('cookie-banner').style.display = 'block';
    } else {
        console.log('Cookie found:', getCookie('cookies_accepted'));
        document.getElementById('cookie-banner').style.display = 'none';
    }

    // Обработчик для кнопки "Принять"
    document.getElementById('accept-cookies').onclick = function() {
        setCookie('cookies_accepted', 'true', 7);
        document.getElementById('cookie-banner').style.display = 'none';
    };

    // Обработчик для кнопки "Отклонить"
    document.getElementById('decline-cookies').onclick = function() {
        setCookie('cookies_accepted', 'false', 7);
        document.getElementById('cookie-banner').style.display = 'none';
        document.getElementById('cookie-warning').style.display = 'block';
        document.getElementById('cookie-settings').style.display = 'block';
        
        // Удаляем корзину из cookies
        setCookie('cart', '', -1);
    };

    // Показ настроек куки если пользователь уже отказался
    if (getCookie('cookies_accepted') === 'false') {
        document.getElementById('cookie-settings').style.display = 'block';
    }

    // Обработчик для кнопки "Настройки куки"
    document.getElementById('cookie-settings').onclick = function() {
        document.getElementById('cookie-banner').style.display = 'block';
        document.getElementById('cookie-warning').style.display = 'none';
        this.style.display = 'none';
    };

    // ==============================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ==============================
    
    // Функция для установки куки
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // Функция для получения куки по имени
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Функция смены главного изображения товара
    function changeMainImage(newSrc) {
        let mainImage = document.getElementById("mainImage");
        if (mainImage && mainImage.src !== newSrc) {
            mainImage.classList.add("fade-out"); 
            setTimeout(() => {
                mainImage.src = newSrc;
                mainImage.classList.remove("fade-out"); 
            }, 200); 
        }
    }

    // Функция проверки видимости элемента в viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }

    // Анимация появления элементов при скролле
    const newArrivalsElements = document.querySelectorAll('.new-arrivals');
    if (newArrivalsElements.length > 0) {
        window.addEventListener('scroll', function() {
            newArrivalsElements.forEach(function(el) {
                if (isElementInViewport(el)) {
                    el.classList.add('visible');
                } else {
                    el.classList.remove('visible');
                }
            });
        });

        // Проверка при загрузке страницы
        window.addEventListener('load', function() {
            newArrivalsElements.forEach(function(el) {
                if (isElementInViewport(el)) {
                    el.classList.add('visible');
                }
            });
        });
    }

    // Функция выбора размера товара
    function selectSize(size, el) {
        document.getElementById('selectedSize').value = size;
        const buttons = document.querySelectorAll('.size-options button');
        buttons.forEach(btn => btn.classList.remove('selected'));
        if (el && el.classList) {
            el.classList.add('selected');
        }
    }

    // ==============================
    // FAQ СИСТЕМА
    // ==============================
    
    // Для секции ухода
    document.querySelectorAll('.faq-toggle').forEach(faqToggleBtn => {
        const faqSection = faqToggleBtn.nextElementSibling;
        faqToggleBtn.addEventListener('click', () => {
            faqSection.classList.toggle('open');
            faqToggleBtn.classList.toggle('open');
        });
    });

    // Для всех вопросов FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const parentContainer = question.closest('.faq-container');
            
            // Закрываем другие ответы в том же контейнере
            parentContainer.querySelectorAll('.faq-answer').forEach(a => {
                if (a !== answer) a.classList.remove('open');
            });
            parentContainer.querySelectorAll('.faq-question').forEach(q => {
                if (q !== question) q.classList.remove('open');
            });
            
            // Переключаем текущий вопрос/ответ
            answer.classList.toggle('open');
            question.classList.toggle('open');
        });
    });

    // ==============================
    // РЕСАЙЗ И АДАПТАЦИЯ
    // ==============================
    
    window.addEventListener("resize", function() {
        // Закрываем мобильное меню при переходе на десктоп
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});

// Глобальные функции для использования в HTML
function changeMainImage(newSrc) {
    let mainImage = document.getElementById("mainImage");
    if (mainImage && mainImage.src !== newSrc) {
        mainImage.classList.add("fade-out"); 
        setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.classList.remove("fade-out"); 
        }, 200); 
    }
}

function selectSize(size, el) {
    document.getElementById('selectedSize').value = size;
    const buttons = document.querySelectorAll('.size-options button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    if (el && el.classList) {
        el.classList.add('selected');
    }
}