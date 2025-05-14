document.addEventListener("DOMContentLoaded", function () {
    // Бургер-меню для мобильной версии
    const burger = document.querySelector('.burger_media');
    const menu = document.getElementById('mobileMenu');
    const toggleButton = document.querySelector('.chat-toggle');
    const socialPanel = document.querySelector('.social');
  
        toggleButton.addEventListener('click', function () {
        // Переключаем отображение социальных иконок
        socialPanel.classList.toggle('active');
        // Переключаем активное состояние кнопки, чтобы изменить её цвет
        toggleButton.classList.toggle('active');
        });
        burger.addEventListener('click', () => {
        menu.classList.toggle('open');
        });
  const catalogLink = document.querySelector("#catalogLink"); // Ссылка на "Каталог"
  let lastClickTime = 0; // Время последнего клика
  function isMobile() {
    return window.innerWidth <= 768; // Если ширина экрана меньше или равна 768px
  }
  if (catalogLink && isMobile()) {
    catalogLink.addEventListener("click", function(e) {
      const currentTime = new Date().getTime(); // Время текущего клика
      if (currentTime - lastClickTime < 1200) { // Если два клика происходят за 1200 мс
        // Переход по ссылке
        window.location.href = catalogLink.href;
      } else {
        // Ожидание второго клика
        e.preventDefault();
      }
      lastClickTime = currentTime; // Обновляем время последнего клика
    });
  }
  // Если пользователь изменяет размер окна (например, с мобильного на десктоп), нужно отключать/включать обработчик
  window.addEventListener("resize", function() {
    if (catalogLink) {
      // Если экран стал мобильным
      if (isMobile()) {
        catalogLink.addEventListener("click", clickHandler);
      } else {
        catalogLink.removeEventListener("click", clickHandler);
      }
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
  // Инициализируем индекс, если один из radio уже выбран
  radios.forEach((radio, i) => {
    if (radio.checked) currentIndex = i;
    radio.addEventListener("change", () => (currentIndex = i));
  });
});
  function clickHandler(e) {
    const currentTime = new Date().getTime(); // Время текущего клика
    if (currentTime - lastClickTime < 1200) { // Если два клика происходят за 1200 мс
      // Переход по ссылке
      window.location.href = catalogLink.href;
    } else {
      // Ожидание второго клика
      e.preventDefault();
    }
    lastClickTime = currentTime; // Обновляем время последнего клика
  }
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
    banner.classList.add('show');  // плавное появление
    banner.style.display = 'block';  // чтобы баннер вообще был видимым
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
});
function changeMainImage(newSrc) {
    let mainImage = document.getElementById("mainImage");
    if (mainImage && mainImage.src !== newSrc) {
        mainImage.classList.add("fade-out"); // Начинаем анимацию исчезновения
        setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.classList.remove("fade-out"); // Возвращаем нормальное состояние
        }, 200); // Время должно совпадать с CSS-анимацией
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
  const slideCount = 4; // у тебя 4 слайда
  setInterval(() => {
      document.getElementById('r' + counter).checked = true;
      counter++;
      if (counter > slideCount) {
          counter = 1;
      }
  }, 10000); // 15000 мс = 15 секунд
// Основной заголовок "Часто задаваемые вопросы"
const faqToggleBtn = document.querySelector('.faq-toggle');
const faqSection = document.querySelector('.faq-section');
faqToggleBtn.addEventListener('click', () => {
  faqSection.classList.toggle('open');
  faqToggleBtn.classList.toggle('open'); // для поворота стрелки
});
// Все вопросы
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    // Закрыть все ответы и сбросить стрелки
    document.querySelectorAll('.faq-answer').forEach(a => {
      if (a !== answer) a.classList.remove('open');
    });
    document.querySelectorAll('.faq-question').forEach(q => {
      if (q !== question) q.classList.remove('open');
    });
    // Переключить выбранный
    answer.classList.toggle('open');
    question.classList.toggle('open');
  });
});
