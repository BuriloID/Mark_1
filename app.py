
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import telegram, time
import asyncio
import hashlib
import json
import requests
app = Flask(__name__)
CORS(app)
CDEK_ACCOUNT = 'твой_account'
CDEK_SECURE = 'твой_secure_key'
@app.route('/service', methods=['POST'])
def cdek_service():
    req_data = request.get_json()
    # Генерация security hash
    secure = hashlib.md5(f"{CDEK_ACCOUNT}&{CDEK_SECURE}".encode()).hexdigest()
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "account": CDEK_ACCOUNT,
        "secure": secure,
        "date": time.strftime("%Y-%m-%d %H:%M:%S"),
        **req_data
    }
    # Запрос к СДЭК
    response = requests.post(
        "https://widget.cdek.ru/widget/scripts/service.php",
        headers=headers,
        data=json.dumps(payload)
    )
    return jsonify(response.json())
# Подставьте ваш токен
TOKEN = '7879922019:AAFKrDUzrPBAUqbZN0BudsTySC3C1g3MelY'
# Замените на ваш чат ID
CHAT_ID = 5208308918
bot = telegram.Bot(token=TOKEN)
def send_message_sync(chat_id, text):
    # Запуск асинхронной функции в синхронном контексте
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    return loop.run_until_complete(bot.send_message(chat_id=chat_id, text=text))
@app.route('/buy', methods=['POST'])
def buy():
    size = request.form.get('selectedSize')  # Новый параметр
    first_name = request.form.get('firstName')
    last_name = request.form.get('lastName')
    middle_name = request.form.get('middleName', '')
    phone = request.form.get('phone')
    email = request.form.get('email')
    print(f"Размер: {size}")
    # Данные о товаре
    product_name = request.form.get('product_name')
    product_price = request.form.get('product_price')
    product_id = request.form.get('product_id')
    product_url = request.form.get('product_url')
    # Список товаров из корзины
    cart_items = request.form.getlist('cart_items')
    cart_descriptions = request.form.getlist('cart_item_description')
    cart_prices = request.form.getlist('cart_item_price')
    cart_quantities = request.form.getlist('cart_item_quantity')
    message = f"🆕 Новый заказ:\n👤 Имя: {first_name}\n👤 Фамилия: {last_name}\n📞 Телефон: {phone}\n📧 Email: {email}\n"
    if cart_items:
        cart_total = 0
        message += "📦 Товары из корзины:\n"
        for name, price, quantity, description in zip(cart_items, cart_prices, cart_quantities, cart_descriptions):
            message += f"- {name} ({description}): {price} ₽ x {quantity}\n"
            cart_total += float(price) * int(quantity)
        message += f"\n💰 Итого за корзину: {cart_total} ₽\n"
    elif product_name:
        message += f"📦 Товар: {product_name}\n💰 Цена: {product_price} ₽\n🔗 Ссылка: {product_url}\n"
    if size:
        message += f"📏 Размер: {size}\n"
    try:
        # Отправка сообщения
        send_message_sync(CHAT_ID, message)
        return jsonify({'status': 'success', 'message': 'Заказ успешно отправлен!'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Ошибка при отправке сообщения: {str(e)}'}), 500
# Настройки для базы данных
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///product.db'  # Путь к базе данных
app.config['SECRET_KEY'] = 'supersecretkey'  # Ключ для работы сессий
db = SQLAlchemy(app)
# Таблица для связи "Многие ко многим" между товарами и категориями
product_category = db.Table('product_category',
                            db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True),
                            db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
                            )
new_product_category = db.Table('new_product_category',
                                db.Column('new_product_id', db.Integer, db.ForeignKey('new_product.id'),
                                          primary_key=True),
                                db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
                                )
# Модель Категорий
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # 'men', 'women', 'acs'

    def __repr__(self):
        return f'<Category {self.name}>'
# Основной товар
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    image_url_back = db.Column(db.String(500), nullable=True)
    # Связь многие ко многим с категориями
    categories = db.relationship('Category', secondary=product_category, backref='products')
    details = db.relationship('ProductDetails', backref='product', lazy=True)
    def __repr__(self):
        return f'<Product {self.name}>'
# Новые товары (если не можем объединить с Product)
class NewProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    image_url_back = db.Column(db.String(500), nullable=True)
    # Связь многие ко многим с категориями
    categories = db.relationship('Category', secondary=new_product_category, backref='new_products')
    details = db.relationship('ProductDetails', backref='new_product', lazy=True)
    def __repr__(self):
        return f'<NewProduct {self.name}>'
# Детали товара (связаны и с Product, и с NewProduct)
class ProductDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    new_product_id = db.Column(db.Integer, db.ForeignKey('new_product.id'), nullable=True)
    full_description = db.Column(db.Text, nullable=True)
    composition = db.Column(db.Text, nullable=True)
    extra_image1 = db.Column(db.String(500), nullable=True)
    extra_image2 = db.Column(db.String(500), nullable=True)
    extra_image3 = db.Column(db.String(500), nullable=True)
    extra_image4 = db.Column(db.String(500), nullable=True)
    extra_image5 = db.Column(db.String(500), nullable=True)
    extra_image6 = db.Column(db.String(500), nullable=True)
    def __repr__(self):
        return f'<ProductDetails {self.id}>'
@app.route('/index')
@app.route('/')
def index():
    try:
        products = NewProduct.query.order_by(NewProduct.id.desc()).limit(5).all()  # Получаем 5 товаров из базы данных NewProduct
        if not products:  # Если список пустой
            message = "Товары не найдены"
        else:
            message = None  # Если товары есть, не передаем сообщение
    except Exception as e:
        message = f"Ошибка при загрузке товаров: {str(e)}"
        products = []  # В случае ошибки отправляем пустой список товаров
    return render_template('index.html', products=products)
@app.route('/about')
def about():
    return render_template('about.html')
@app.route('/catalog')
def catalog():
    name = request.args.get('name')
    category_name = request.args.get('category')
    # Запрос только для обычных товаров (не новинок)
    query_product = Product.query
    if category_name:
        query_product = query_product.join(Product.categories).filter(Category.name == category_name)
    if name:
        query_product = query_product.filter(Product.name == name)
    # Получаем все товары из каталога
    products = query_product.all()
    return render_template('catalog.html', products=products, product_type='catalog')
@app.route('/new')
def new():
    try:
        products = NewProduct.query.all()  # Получаем все товары из базы данных NewProduct
        if not products:  # Если список пустой
            message = "Товары не найдены"
        else:
            message = None  # Если товары есть, не передаем сообщение
    except Exception as e:
        message = f"Ошибка при загрузке товаров: {str(e)}"
        products = []  # В случае ошибки отправляем пустой список товаров
    return render_template('new.html', products=products, message=message)
@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product_type = request.args.get('product_type')  # Получаем тип продукта (product или new_product)
    # В зависимости от типа продукта ищем товар
    if product_type == 'new_product':
        product = NewProduct.query.get_or_404(product_id)
        details = ProductDetails.query.filter_by(new_product_id=product.id).first()
    else:
        product = Product.query.get_or_404(product_id)
        details = ProductDetails.query.filter_by(product_id=product.id).first()
    # Проверяем, если товар не найден
    if not product:
        return "Product not found", 404
    return render_template('product_detail.html', product=product, details=details)
@app.route('/client')
def client():
    return render_template('client.html')
@app.route('/cart')
def cart():
    # Получаем куку с корзиной, если она есть
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)  # Преобразуем строку обратно в словарь
    total_price = sum(item['price'] * item['quantity'] for item in cart_items.values())
    return render_template('cart.html', cart=cart_items, total_price=total_price)
@app.route('/add_to_cart/<int:product_id>')
def add_to_cart(product_id):
    product = Product.query.get_or_404(product_id)
    # Получаем куку с корзиной, если она есть
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)  # Преобразуем строку обратно в словарь
    # Если товар уже в корзине, увеличиваем количество
    if str(product_id) in cart_items:
        cart_items[str(product_id)]['quantity'] += 1
    else:
        cart_items[str(product_id)] = {
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'quantity': 1,
            'image_url': product.image_url
        }
    # Сохраняем обновленную корзину в куки (срок действия 7 дней)
    resp = make_response(redirect(url_for('cart')))
    resp.set_cookie('cart', json.dumps(cart_items), max_age=365*24*60*60)  # Кука на 365 дней
    return resp
@app.route('/remove_from_cart/<product_id>')
def remove_from_cart(product_id):
    try:
        # Преобразуем product_id в целое число
        product_id = int(product_id)
    except ValueError:
        return "Invalid product ID", 400  # Возвращаем ошибку, если передано неверное значение
    # Получаем куку с корзиной
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)  # Преобразуем строку обратно в словарь
    # Удаляем товар, если он есть в корзине
    if str(product_id) in cart_items:
        del cart_items[str(product_id)]
    # Сохраняем обновленную корзину в куки
    resp = make_response(redirect(url_for('cart')))
    resp.set_cookie('cart', json.dumps(cart_items), max_age=365*24*60*60)  # Кука на 365 дней
    return resp

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Создаём все таблицы
    app.run(debug=True)