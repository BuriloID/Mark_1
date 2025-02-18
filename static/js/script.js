document.querySelector('.fa-bars').addEventListener("click", function(e) {
  e.preventDefault();
  document.querySelector('.menu').classList.toggle('menu_active');
  document.querySelector('.content').classList.toggle('content_active');
})
document.addEventListener("DOMContentLoaded", function() {
    const burger = document.querySelector(".burger");
    burger.addEventListener("click", function() {
        this.classList.toggle("burger_active");
    });
});
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".hor_menu ul li ul li ul").forEach(ul => {
        let items = ul.children.length; // Количество элементов в подменю
        // Устанавливаем 2 колонки, только если количество элементов больше 4 и оно чётное
        if (items > 4 && items % 2 === 0) {
            ul.style.columnCount = "2"; // Делаем 2 колонки
            ul.style.width = "400px"; // Ширина автоматическая для подменю
            ul.style.backgroundColor = "#FFFAFA"; // Цвет фона
            ul.style.border = "1px solid rgba(0, 0, 0, 0.1)"; // Граница
            ul.style.boxSizing = "border-box"; // Учитываем padding и border
        } else {
            // Если элементов 3 или меньше, то убираем колонки
            ul.style.columnCount = "1"; // Одна колонка
            ul.style.columnGap = "0"; // Нет зазоров
            ul.style.width = "400px"; // Фиксированная ширина для подменю
        }
        // Убираем маргины и паддинги у всех дочерних элементов
        Array.from(ul.children).forEach(li => {
            li.style.margin = "0"; // Убираем маргин
            li.style.padding = "0"; // Убираем паддинг
        });
    });
});





