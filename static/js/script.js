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
// БЛОК ФИЛЬТР (шторка)
// ==============================

const drawer = document.getElementById('filterDrawer');
const handle = document.getElementById('filterHandle');

// Клик по ручке — открыть/закрыть
handle.addEventListener('click', () => {
  drawer.classList.toggle('open');
});

// ====== Свайпы (только по handle) ======
let startY = null;
let isSwiping = false;

// Начало касания
handle.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
  isSwiping = true;
  e.preventDefault(); // Предотвращаем скролл страницы
}, { passive: false }); // Важно: passive: false для возможности preventDefault

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
    drawer.classList.add('open');
    isSwiping = false;
    startY = null;
  }

  // Свайп вверх — закрыть
  if (diff < -50) {
    drawer.classList.remove('open');
    isSwiping = false;
    startY = null;
  }
}, { passive: false }); // passive: false для touchmove тоже

// Конец касания
handle.addEventListener('touchend', () => {
  isSwiping = false;
  startY = null;
});
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