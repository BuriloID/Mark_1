document.addEventListener("DOMContentLoaded", function () {
    // Гамбургер меню
    const burger = document.querySelector(".burger");
    if (burger) {
        burger.addEventListener("click", function () {
            this.classList.toggle("burger_active");
        });
    }
    // Обработка кнопки .fa-bars для меню
    const faBars = document.querySelector('.fa-bars');
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
});
// Функция смены главного изображения
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
const openPopUp = document.getElementById('open_pop_up');
const closePopUp = document.getElementById('pop_up_close');
const popUp = document.getElementById('pop_up');
const orderForm = document.getElementById('orderForm');
openPopUp.addEventListener('click', function(e) {
    e.preventDefault();
    popUp.classList.add('active');
});
closePopUp.addEventListener('click', () => {
    popUp.classList.remove('active');
});
// Отправка данных формы
orderForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => { data[key] = value });
    fetch('/buy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Заказ успешно отправлен!');
            popUp.classList.remove('active'); // Закрываем поп-ап после успешной отправки
            this.reset(); // Очищаем форму
        } else {
            alert('Ошибка: ' + data.message);
        }
    })
    .catch((error) => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке заказа.');
    });
});
