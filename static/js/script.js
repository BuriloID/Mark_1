document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector('.burger_media');
    const menu = document.getElementById('mobileMenu');
    const toggleButton = document.querySelector('.chat-toggle');
    const socialPanel = document.querySelector('.social');
    const overlay = document.querySelector('.menu-overlay');
// Бургер меню
    burger.addEventListener('click', () => {
        menu.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        
        // Сбрасываем подменю при открытии
        if (menu.classList.contains('open')) {
            resetAllSubmenus();
        }
    });

    // Оверлей
    if (overlay) {
        overlay.addEventListener('click', () => {
            menu.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            resetAllSubmenus();
        });
    }

    // Обработчики для пунктов меню
    document.querySelectorAll('#mobileMenu li a').forEach(link => {
        link.addEventListener('click', function(e) {
            const submenu = this.nextElementSibling;
            
            // Если есть подменю и мы на мобильном
            if (submenu && submenu.tagName === 'UL' && window.innerWidth <= 768) {
                e.preventDefault();
                
                // Сдвигаем основное меню
                menu.querySelector('ul').style.transform = 'translateX(-100%)';
                menu.classList.add('has-active-submenu');
                
                // Показываем подменю
                submenu.style.left = '0';
                submenu.classList.add('active');
                
                // Добавляем кнопку "Назад" если её нет
                if (!submenu.querySelector('.backBtn')) {
                    const backBtn = document.createElement('li');
                    backBtn.innerHTML = '<a href="#" class="backBtn">← Назад</a>';
                    submenu.insertBefore(backBtn, submenu.firstChild);
                    
                    // Обработчик для кнопки "Назад"
                    backBtn.querySelector('a').addEventListener('click', function(ev) {
                        ev.preventDefault();
                        
                        // Возвращаем подменю обратно
                        submenu.style.left = '100%';
                        submenu.classList.remove('active');
                        
                        // Возвращаем основное меню
                        menu.querySelector('ul').style.transform = 'translateX(0)';
                        menu.classList.remove('has-active-submenu');
                        
                        // Удаляем кнопку "Назад"
                        backBtn.remove();
                    });
                }
            }
        });
    });

    // Обычные ссылки (без подменю)
    document.querySelectorAll('#mobileMenu li:not(:has(ul)) > a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                menu.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
                resetAllSubmenus();
            }
        });
    });

    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
            resetAllSubmenus();
        }
    });

    // Функция сброса всех подменю
    function resetAllSubmenus() {
        // Возвращаем основное меню
        const mainMenu = menu.querySelector('ul');
        if (mainMenu) {
            mainMenu.style.transform = 'translateX(0)';
        }
        
        // Сбрасываем все подменю
        document.querySelectorAll('#mobileMenu li ul').forEach(submenu => {
            submenu.style.left = '100%';
            submenu.classList.remove('active');
            
            // Удаляем кнопки "Назад"
            const backBtn = submenu.querySelector('.backBtn');
            if (backBtn) {
                backBtn.remove();
            }
        });
        
        menu.classList.remove('has-active-submenu');
    }

    // Реинициализация при ресайзе
    window.addEventListener("resize", function() {
        if (window.innerWidth > 768) {
            resetAllSubmenus();
        }
    });











    // ===== ОСТАЛЬНОЙ ВАШ КОД ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ =====
      toggleButton.addEventListener('click', function () {
      socialPanel.classList.toggle('active');
      toggleButton.classList.toggle('active');
      });
  const catalogLink = document.querySelector("#catalogLink"); 
    let lastCatalogClickTime = 0; 
    let catalogClickTimeout = null; 
  function isMobile() {
    return window.innerWidth <= 768; 
  }
function setupSlideMenu() {
        let currentLevel = 0;
        const menuStack = [];   
// Обработчик для всех пунктов с подменю (КРОМЕ КАТАЛОГА - у него своя логика)
  document.querySelectorAll('.hor_menu li:has(ul) > a').forEach(link => {
if (link !== catalogLink) {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            const li = this.parentElement;
            const currentUl = li.closest('ul');
            const nextUl = li.querySelector('ul');
            if (nextUl) {
                menuStack.push({
                    ul: currentUl,
                    level: currentLevel
                });
                currentLevel++;
                currentUl.setAttribute('data-menu-level', currentLevel - 1);
                nextUl.setAttribute('data-menu-level', currentLevel);
                setTimeout(() => {
                    currentUl.classList.add('prev');
                    nextUl.classList.add('active');
                }, 10);
            }
        }
    });
}
});  
// ОСОБАЯ ЛОГИКА ДЛЯ КАТАЛОГА - двойной клик
if (catalogLink && isMobile()) {
    catalogLink.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const currentTime = new Date().getTime();
            const timeSinceLastClick = currentTime - lastCatalogClickTime;
            // Если второй клик в течение 500ms - переходим по ссылке
            if (timeSinceLastClick < 500) {
                // Отменяем таймаут и переходим
                if (catalogClickTimeout) {
                    clearTimeout(catalogClickTimeout);
                    catalogClickTimeout = null;
                }
                window.location.href = catalogLink.href;
                return;
            }
            // Первый клик - открываем подменю
            e.preventDefault();
            e.stopPropagation();
            const li = this.parentElement;
            const currentUl = li.closest('ul');
            const nextUl = li.querySelector('ul');
            if (nextUl) {
                menuStack.push({
                    ul: currentUl,
                    level: currentLevel
                });
                currentLevel++;
                currentUl.setAttribute('data-menu-level', currentLevel - 1);
                nextUl.setAttribute('data-menu-level', currentLevel);
                
                setTimeout(() => {
                    currentUl.classList.add('prev');
                    nextUl.classList.add('active');
                }, 10);
            } 
            lastCatalogClickTime = currentTime;
            // Устанавливаем таймаут для сброса
            catalogClickTimeout = setTimeout(() => {
                lastCatalogClickTime = 0;
            }, 500);
        }
    });
} 
// Добавляем кнопки "Назад" динамически
function addBackButtons() {
    document.querySelectorAll('.hor_menu ul ul').forEach(ul => {
        if (!ul.querySelector('.menu-back')) {
            const backLi = document.createElement('li');
            backLi.className = 'menu-back';
            backLi.innerHTML = '<a href="javascript:void(0)">‹ Назад</a>';
            backLi.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (menuStack.length > 0) {
                    const prev = menuStack.pop();
                    const currentUl = this.parentElement;
                    currentUl.classList.remove('active');
                    prev.ul.classList.remove('prev');
                    currentLevel--;
                    setTimeout(() => {
                        currentUl.removeAttribute('data-menu-level');
                    }, 300);
                }
            });
            ul.insertBefore(backLi, ul.firstChild);
        }
    });
}
  // Инициализируем кнопки "Назад"
  addBackButtons();
  // Обновляем кнопки при изменении DOM
  const observer = new MutationObserver(addBackButtons);
  if (menu) {
      observer.observe(menu, { childList: true, subtree: true });
  }
}
// Инициализируем систему слайдов
if (isMobile()) {
    setupSlideMenu();
}
// Если пользователь изменяет размер окна (например, с мобильного на десктоп), нужно отключать/включать обработчик
window.addEventListener("resize", function() {
    if (isMobile()) {
        setupSlideMenu();
    } else {
        document.querySelectorAll('.hor_menu [data-menu-level]').forEach(el => {
            el.classList.remove('active', 'prev');
            el.removeAttribute('data-menu-level');
        });
    }
});
  const slides = document.querySelector(".slides");
  const radios = document.querySelectorAll('input[name="r"]');
  let startX = 0;
  let endX = 0;
  let currentIndex = 0;
  const updateIndex = () => {
    radios[currentIndex].checked = true;
  };
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
  // Инициализируем индекс, если один из radio уже выбран
  radios.forEach((radio, i) => {
    if (radio.checked) currentIndex = i;
    radio.addEventListener("change", () => (currentIndex = i));
  });
});
  const isSuccess = document.body.dataset.orderSuccess === "true";
    if (isSuccess) {
        setTimeout(function () {
            location.reload();
        }, 1000);
    }
    // Обработка кнопки .fa-bars для меню
    const faBars = document.querySelector('.fa-bars ');
    if (faBars) {
        faBars.addEventListener("click", function (e) {
            e.preventDefault();
            const menu = document.querySelector('.menu');
            const content = document.querySelector('.content');
            if (menu) menu.classList.toggle('menu_active');
            if (content) content.classList.toggle('content_active');
        });
    }
    // Обработка подменю и колонок в .hor_menu
    document.querySelectorAll(".hor_menu ul li ul li ul").forEach(ul => {
        let items = ul.children.length;
        // Устанавливаем 2 колонки, только если количество элементов больше 4 и оно чётное
        if (items > 4 && items % 2 === 0) {
            ul.style.columnCount = "2";
            ul.style.width = "400px";
            ul.style.backgroundColor = "#FFFAFA";
            ul.style.border = "1px solid rgba(0, 0, 0, 0.1)";
            ul.style.boxSizing = "border-box";
        } else {
            ul.style.columnCount = "1";
            ul.style.columnGap = "0";
            ul.style.width = "400px";
        }
        Array.from(ul.children).forEach(li => {
            li.style.margin = "0";
            li.style.padding = "0";
        });
    });
 // Форма, попап и тост
 const form = document.getElementById("form");
 const toast = document.getElementById("toast");
 const popup = document.getElementById("pop_up");
 const popUpClose = document.getElementById("pop_up_close");
 const openPopUp = document.getElementById('open_pop_up');

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
                if (popup) popup.classList.remove("active");
                if (toast) {
                    toast.classList.add("show"); // Показываем тост
                    setTimeout(() => {
                        toast.classList.remove("show"); 
                    }, 4000); 
                }
                form.reset();

                if (window.location.pathname === "/cart") {
                    setTimeout(() => {
                        window.location.reload();
                    }, 400);
                }

            } else {
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
 if (popUpClose) {
     popUpClose.addEventListener("click", () => {
         if (popup) popup.classList.remove("active");
     });
 }
 if (openPopUp) {
     openPopUp.addEventListener("click", function(e) {
         e.preventDefault();
         if (popup) popup.classList.add('active');
     });
 }
    // Проверка наличия куки для согласия
if (!getCookie('cookies_accepted')) {
    console.log('Cookie not found, showing banner.');
    document.getElementById('cookie-banner').style.display = 'block';  // Показываем баннер
} else {
    console.log('Cookie found:', getCookie('cookies_accepted'));
    document.getElementById('cookie-banner').style.display = 'none';  // Скрываем баннер, если куки уже есть
}
// Обработчик для кнопки "Принять"
document.getElementById('accept-cookies').onclick = function() {
    setCookie('cookies_accepted', 'true', 7);  // Устанавливаем куку на 7 дней
    document.getElementById('cookie-banner').style.display = 'none';  // Скрываем баннер
};
// Обработчик для кнопки "Отклонить"
document.getElementById('decline-cookies').onclick = function() {
    setCookie('cookies_accepted', 'false', 7);  // Устанавливаем куку, что куки отклонены
    document.getElementById('cookie-banner').style.display = 'none';  // Скрываем баннер
    document.getElementById('cookie-warning').style.display = 'block';  // Показываем предупреждение о том, что корзина не сохраняется
};
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
if (getCookie('cookies_accepted') === 'false') {
    // Удаляем корзину из cookies
    setCookie('cart', '', -1);
}
if (!getCookie('cookies_accepted')) {
    console.log('Cookie not found, showing banner.');
    var banner = document.getElementById('cookie-banner');
    banner.classList.add('show');  
    banner.style.display = 'block'; 
} else {
    console.log('Cookie found:', getCookie('cookies_accepted'));
}
// После отказа — показываем кнопку "Настройки куки"
document.getElementById('decline-cookies').onclick = function() {
    setCookie('cookies_accepted', 'false', 7);
    document.getElementById('cookie-banner').style.display = 'none';
    document.getElementById('cookie-warning').style.display = 'block';
    document.getElementById('cookie-settings').style.display = 'block'; // показать кнопку настроек
};
// Если пользователь уже отказался ранее — показать "Настройки куки"
if (getCookie('cookies_accepted') === 'false') {
    document.getElementById('cookie-settings').style.display = 'block';
}
// При клике на "Настройки куки" — можно снова показать баннер
document.getElementById('cookie-settings').onclick = function() {
    document.getElementById('cookie-banner').style.display = 'block';
    document.getElementById('cookie-warning').style.display = 'none';
    this.style.display = 'none'; // прячем кнопку настроек
};
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
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
}
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}
// Получаем все элементы с классом new-arrivals
const newArrivalsElements = document.querySelectorAll('.new-arrivals');
// Добавляем обработчик события прокрутки
window.addEventListener('scroll', function() {
    newArrivalsElements.forEach(function(el) {
        if (isElementInViewport(el)) {
            el.classList.add('visible');
        } else {
            el.classList.remove('visible');
        }
    });
});
// Вызываем сразу при загрузке страницы
window.addEventListener('load', function() {
    newArrivalsElements.forEach(function(el) {
        if (isElementInViewport(el)) {
            el.classList.add('visible');
        }
    });
});
function selectSize(size, el) {
    // Установить выбранный размер в скрытое поле
    document.getElementById('selectedSize').value = size;
    // Убрать класс 'selected' с всех кнопок
    const buttons = document.querySelectorAll('.size-options button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    // Добавить класс 'selected' выбранной кнопке
    if (el && el.classList) {
        el.classList.add('selected');
    }
}   
  let counter = 1;
  const slideCount = 4; 
  setInterval(() => {
      document.getElementById('r' + counter).checked = true;
      counter++;
      if (counter > slideCount) {
          counter = 1;
      }
  }, 10000); 
// FAQ toggle logic
document.addEventListener('DOMContentLoaded', function() {
  // Для секции ухода (если есть faq-toggle)
  document.querySelectorAll('.faq-toggle').forEach(faqToggleBtn => {
    const faqSection = faqToggleBtn.nextElementSibling;
    faqToggleBtn.addEventListener('click', () => {
      faqSection.classList.toggle('open');
      faqToggleBtn.classList.toggle('open');
    });
  });

  // Для всех вопросов
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const parentContainer = question.closest('.faq-container');
      // Закрываем только в пределах одного блока .faq-container
      parentContainer.querySelectorAll('.faq-answer').forEach(a => {
        if (a !== answer) a.classList.remove('open');
      });
      parentContainer.querySelectorAll('.faq-question').forEach(q => {
        if (q !== question) q.classList.remove('open');
      });
      answer.classList.toggle('open');
      question.classList.toggle('open');
    });
  });
});
