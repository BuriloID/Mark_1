from flask import Flask, render_template, request, redirect, url_for, session, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy 
from flask_cors import CORS
import telegram, time
import asyncio
import hashlib
import json
import requests
import threading
import re
from sqlalchemy import or_

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
CORS(app)

# Токен и чат
TOKEN = '7879922019:AAFKrDUzrPBAUqbZN0BudsTySC3C1g3MelY'
CHAT_ID = 5208308918

# Настройки для базы данных (увеличен таймаут и выключен track modifications)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///product.db'
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'timeout': 30}
}

db = SQLAlchemy(app)

# Модели (оставлены без изменений, чтобы не ломать миграции)

product_category = db.Table('product_category',
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
)
new_product_category = db.Table('new_product_category',
    db.Column('new_product_id', db.Integer, db.ForeignKey('new_product.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)
    status = db.Column(db.String(20), default='pending')
    cart_data = db.Column(db.Text, nullable=False)
    customer_info = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    def __repr__(self):
        return f'<Category {self.name}>'

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    image_url_back = db.Column(db.String(500), nullable=True)
    sale = db.Column(db.Integer, default=0)
    categories = db.relationship('Category', secondary=product_category, backref='products')
    details = db.relationship('ProductDetails', backref='product', lazy=True)
    def __repr__(self):
        return f'<Product {self.name}>'

class NewProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    image_url_back = db.Column(db.String(500), nullable=True)
    categories = db.relationship('Category', secondary=new_product_category, backref='new_products')
    details = db.relationship('ProductDetails', backref='new_product', lazy=True)
    def __repr__(self):
        return f'<NewProduct {self.name}>'

class ProductDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    new_product_id = db.Column(db.Integer, db.ForeignKey('new_product.id'), nullable=True)
    full_description = db.Column(db.Text, nullable=True)
    composition = db.Column(db.Text, nullable=True)
    size = db.Column(db.Text, nullable=True)
    extra_image1 = db.Column(db.String(500), nullable=True)
    extra_image2 = db.Column(db.String(500), nullable=True)
    extra_image3 = db.Column(db.String(500), nullable=True)
    extra_image4 = db.Column(db.String(500), nullable=True)
    extra_image5 = db.Column(db.String(500), nullable=True)
    extra_image6 = db.Column(db.String(500), nullable=True)
    def __repr__(self):
        return f'<ProductDetails {self.id}>'

class Collection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_1 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_2 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_3 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_4 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_5 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_6 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_7 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_8 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_9 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_10 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_11 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    id_12 = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    col_description = db.Column(db.Text, nullable=True)
    col_image = db.Column(db.String(255), nullable=True)
    product_1 = db.relationship('Product', foreign_keys=[id_1])
    product_2 = db.relationship('Product', foreign_keys=[id_2])
    product_3 = db.relationship('Product', foreign_keys=[id_3])
    product_4 = db.relationship('Product', foreign_keys=[id_4])
    product_5 = db.relationship('Product', foreign_keys=[id_5])
    product_6 = db.relationship('Product', foreign_keys=[id_6])
    product_7 = db.relationship('Product', foreign_keys=[id_7])
    product_8 = db.relationship('Product', foreign_keys=[id_8])
    product_9 = db.relationship('Product', foreign_keys=[id_9])
    product_10 = db.relationship('Product', foreign_keys=[id_10])
    product_11 = db.relationship('Product', foreign_keys=[id_11])
    product_12 = db.relationship('Product', foreign_keys=[id_12])

class CollectionTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_col = db.Column(db.Integer, db.ForeignKey('collection.id'), nullable=False)
    col_image = db.Column(db.String(255), nullable=True)
    collection = db.relationship('Collection', backref='collection_tables')
    col_name = db.Column(db.String(255))

# Telegram bot
bot = telegram.Bot(token=TOKEN)
def send_message_sync(chat_id, text, reply_markup=None):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    return loop.run_until_complete(bot.send_message(chat_id=chat_id, text=text, reply_markup=reply_markup))

@app.route('/start_order/<int:order_id>', methods=['POST'])
def start_order(order_id):
    try:
        order = Order.query.filter_by(order_id=str(order_id)).first()
        if order:
            order.status = 'processing'
            db.session.commit()
            return jsonify({'status': 'ok'})
        return jsonify({'status': 'not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.session.close()

@app.route('/buy', methods=['POST'])
def buy():
    size = request.form.get('selectedSize')
    first_name = request.form.get('firstName')
    last_name = request.form.get('lastName')
    middle_name = request.form.get('middleName')
    phone = request.form.get('phone')
    email = request.form.get('email')
    product_name = request.form.get('product_name')
    product_price = request.form.get('product_price')
    product_descriptions = request.form.get('product_description')
    product_url = request.form.get('product_url')
    cart_items = request.form.getlist('cart_items')
    cart_descriptions = request.form.getlist('cart_item_description')
    cart_prices = request.form.getlist('cart_item_price')
    cart_quantities = request.form.getlist('cart_item_quantity')
    order_id = int(time.time())
    message = f"🆕 Новый заказ:\n👤 Имя: {first_name}\n👤 Фамилия: {last_name}\n👤 Отчество: {middle_name if middle_name else 'Не указано'}\n📞 Телефон: {phone}\n📧 Email: {email}\n"
    keyboard = None
    try:
        if cart_items:
            cart_total = 0
            message += "📦 Товары из корзины:\n"
            for name, price, quantity, description in zip(cart_items, cart_prices, cart_quantities, cart_descriptions):
                message += f"- {name} ({description}): {price} ₽ x {quantity}\n"
                cart_total += float(price) * int(quantity)
            message += f"\n💰 Итого за корзину: {cart_total} ₽\n"
            message += f"\n🆔 Заказ ID: {order_id}\n"
            keyboard = telegram.InlineKeyboardMarkup([[telegram.InlineKeyboardButton("✅ Начать выполнение", callback_data=f"start_{order_id}")]])
            order = Order(
                order_id=str(order_id),
                status='pending',
                cart_data=json.dumps({'items': list(zip(cart_items, cart_prices, cart_quantities, cart_descriptions))}),
                customer_info=json.dumps({
                    'first_name': first_name,
                    'last_name': last_name,
                    'middle_name': middle_name,
                    'phone': phone,
                    'email': email
                })
            )
            db.session.add(order)
            db.session.commit()
        elif product_name:
            message += f"📦 Товар: {product_name} ({product_descriptions})\n💰 Цена: {product_price} ₽\n🔗 Ссылка: {product_url}\n"
            message += f"\n🆔 Заказ ID: {order_id}\n"
            keyboard = telegram.InlineKeyboardMarkup([[telegram.InlineKeyboardButton("✅ Начать выполнение", callback_data=f"start_{order_id}")]])
            order = Order(
                order_id=str(order_id),
                status='pending',
                cart_data=json.dumps({'items': [(product_name, product_price, 1, product_descriptions)]}),
                customer_info=json.dumps({
                    'first_name': first_name,
                    'last_name': last_name,
                    'middle_name': middle_name,
                    'phone': phone,
                    'email': email
                })
            )
            db.session.add(order)
            db.session.commit()
        else:
            return jsonify({'status': 'error', 'message': 'Нет данных для оформления заказа'}), 400

        send_message_sync(CHAT_ID, message, reply_markup=keyboard)

        resp = make_response(jsonify({'status': 'success', 'message': 'Заказ успешно отправлен!'}), 200)
        resp.set_cookie('cart', '{}', max_age=0)
        return resp
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'Ошибка: {str(e)}'}), 500
    finally:
        db.session.close()
@app.route('/catalog/filter', methods=['POST'])
def catalog_filter():
    import traceback
    print("DEBUG: Entering catalog_filter")
    try:
        data = request.get_json()
        print(f"DEBUG: Received data: {data}")
        
        min_price = data.get('min_price')
        max_price = data.get('max_price')
        compositions = data.get('compositions', [])
        
        # Базовые запросы
        query_product = Product.query.join(Product.details)
        query_new = NewProduct.query.join(NewProduct.details)
        
        # Применяем фильтры по цене
        if min_price:
            query_product = query_product.filter(Product.price >= float(min_price))
            query_new = query_new.filter(NewProduct.price >= float(min_price))
        
        if max_price:
            query_product = query_product.filter(Product.price <= float(max_price))
            query_new = query_new.filter(NewProduct.price <= float(max_price))
        
        # Фильтр по составу — ПРАВИЛЬНЫЙ
        if compositions:
            filtered_products = []
            
            for product in query_product.all():
                if not product.details or not product.details[0].composition:
                    continue
                
                # Получаем полный состав товара
                product_composition = product.details[0].composition
                
                # Проверяем, содержит ли состав товара любой из выбранных фильтров
                if any(comp in product_composition for comp in compositions):
                    filtered_products.append(product)
            
            filtered_new = []
            
            for product in query_new.all():
                if not product.details or not product.details[0].composition:
                    continue
                
                # Получаем полный состав товара
                product_composition = product.details[0].composition
                
                # Проверяем, содержит ли состав товара любой из выбранных фильтров
                if any(comp in product_composition for comp in compositions):
                    filtered_new.append(product)
            
            all_products = filtered_new + filtered_products
        else:
            all_products = query_new.all() + query_product.all()
        
        # Получаем ВСЕ уникальные составы для отображения в фильтре
        all_compositions_set = set()
        
        # Для Product
        product_details = ProductDetails.query.filter(
            ProductDetails.product_id.isnot(None),
            ProductDetails.composition.isnot(None),
            ProductDetails.composition != ''
        ).all()
        
        for detail in product_details:
            if detail.composition:
                # Добавляем полный состав как есть
                all_compositions_set.add(detail.composition.strip())
        
        # Для NewProduct
        new_product_details = ProductDetails.query.filter(
            ProductDetails.new_product_id.isnot(None),
            ProductDetails.composition.isnot(None),
            ProductDetails.composition != ''
        ).all()
        
        for detail in new_product_details:
            if detail.composition:
                # Добавляем полный состав как есть
                all_compositions_set.add(detail.composition.strip())
        
        # Сортируем
        all_compositions = sorted(all_compositions_set)
        
        # Формируем HTML для товаров
        products_html = ""
        for product in all_products:
            is_new_product = isinstance(product, NewProduct)
            product_type_str = 'new_product' if is_new_product else 'product'

            # Изображения
            if product.image_url:
                main_img = f'/static/{product.image_url}'
                image_html = f'<img src="{main_img}" alt="{product.name}" class="main-img">'
                if product.image_url_back:
                    back_img = f'/static/{product.image_url_back}'
                    image_html += f'<img src="{back_img}" alt="{product.name}" class="hover-img">'
            else:
                image_html = '<img src="https://via.placeholder.com/150">'

            # Цена
            price_display = int(product.price)

            # Состав
            composition_html = ''
            if product.details and product.details[0].composition:
                composition_html = f'''
                    <p class="product-composition">
                        <small>{product.details[0].composition}</small>
                    </p>
                '''

            # Карточка
            products_html += f'''
            <div class="product">
                {f'<div class="new-label">New</div>' if is_new_product else ''}
                {image_html}
                <h2>{product.description or ""}</h2>
                <p>{product.name}</p>
                {composition_html}
                <p><strong>{price_display} ₽</strong></p>
                <a href="/product/{product.id}?product_type={product_type_str}">
                    <button class="btn">Перейти</button>
                </a>
            </div>
            '''
        
        # Если товаров нет
        if not products_html:
            products_html = '<p class="no-products">Товары не найдены</p>'
        
        return jsonify({
            'success': True,
            'products_html': products_html,
            'products_count': len(all_products),
            'compositions': all_compositions  # Возвращаем все составы
        })
    except Exception as e:
        print(f"ERROR: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500

    # ДОБАВЛЯЕМ новую функцию для извлечения материалов из composition
def extract_composition_materials(composition_text):
    if not composition_text:
        return []

    import re

    text = composition_text.lower()

    # Убираем проценты и цифры
    text = re.sub(r'\d+(?:\.\d+)?\s*%?', '', text)

    # Убираем служебные слова
    text = re.sub(
        r'\b(состав|материал|материалы|содержит)\b',
        '',
        text
    )

    # Нормализуем разделители
    for sep in [',', ';', '/', '+']:
        text = text.replace(sep, '|')

    parts = [p.strip() for p in text.split('|') if p.strip()]

    materials = []
    for part in parts:
        cleaned = re.sub(r'[^\w\s]', '', part).strip()
        if len(cleaned) >= 3:
            materials.append(cleaned.title())

    return list(set(materials))

@app.route('/collection/<int:collection_id>')
def show_collection(collection_id):
    collection = Collection.query.get_or_404(collection_id)
    products = [
        collection.product_1, collection.product_2, collection.product_3,
        collection.product_4, collection.product_5, collection.product_6,
        collection.product_7, collection.product_8, collection.product_9,
        collection.product_10, collection.product_11, collection.product_12
    ]
    products = [product for product in products if product is not None]
    return render_template('collection.html', collection=collection, products=products)

@app.route('/collection_table')
def collection_table():
    collections = CollectionTable.query.all()
    return render_template('collection_table.html', collections=collections)

@app.route('/index')
@app.route('/')
def index():
    try:
        products = NewProduct.query.order_by(NewProduct.id.desc()).limit(4).all()
        collections = CollectionTable.query.all()
        message = None if products else "Товары не найдены"
    except Exception as e:
        message = f"Ошибка при загрузке товаров: {str(e)}"
        products = []
        collections = []
    return render_template('index.html', products=products, collections=collections, message=message)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/catalog')
def catalog():
    page = request.args.get('page', 1, type=int)
    per_page = 12  

    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    category_name = request.args.get('category')
    search_query = request.args.get('search')
    composition_filters = request.args.getlist('composition') 
    categories = Category.query.all()
    compositions = (
        db.session.query(ProductDetails.composition)
        .filter(
            ProductDetails.composition.isnot(None),
            ProductDetails.composition != ''
        )
        .distinct()
        .order_by(ProductDetails.composition)
        .all()
    )

    # превращаем [('100% Хлопок',), ...] → ['100% Хлопок', ...]
    compositions = [c[0] for c in compositions]
    # Получаем минимумы и максимумы по таблицам с безопасной обработкой
    min_product_price = db.session.query(db.func.min(Product.price)).scalar() or 0
    max_product_price = db.session.query(db.func.max(Product.price)).scalar() or 0
    min_new_price = db.session.query(db.func.min(NewProduct.price)).scalar() or 0
    max_new_price = db.session.query(db.func.max(NewProduct.price)).scalar() or 0

    print("COMPOSITIONS:", compositions)

    # Собираем все найденные значения в список (только те, что не None)
    all_min_prices = [p for p in [min_product_price, min_new_price] if p > 0]
    all_max_prices = [p for p in [max_product_price, max_new_price] if p > 0]

    # Определяем реальные минимальные и максимальные
    real_min_price = int(min(all_min_prices)) if all_min_prices else min(min_product_price, min_new_price) or 0
    real_max_price = int(max(all_max_prices)) + 100 if all_max_prices else max(max_product_price, max_new_price) or 10000

    

    # Запросы
    query_product = Product.query.join(Product.details)
    query_new = NewProduct.query.join(NewProduct.details)

    if min_price is not None:
        query_product = query_product.filter(Product.price >= min_price)
        query_new = query_new.filter(NewProduct.price >= min_price)
    if max_price is not None:
        query_product = query_product.filter(Product.price <= max_price)
        query_new = query_new.filter(NewProduct.price <= max_price)
    if category_name:
        query_product = query_product.filter(Product.categories.any(name=category_name))
        query_new = query_new.filter(NewProduct.categories.any(name=category_name))
    if search_query:
        query_product = query_product.filter(
        or_(
            Product.name.ilike(f"%{search_query}%"),
            Product.description.ilike(f"%{search_query}%")
        )
    )
        query_new = query_new.filter(
        or_(
            NewProduct.name.ilike(f"%{search_query}%"),
            NewProduct.description.ilike(f"%{search_query}%")
        )
    )

# ДОБАВЛЯЕМ: Фильтр по составу (composition)
    if composition_filters:
        query_product = query_product.filter(
            ProductDetails.composition.in_(composition_filters)
        )
        query_new = query_new.filter(
            ProductDetails.composition.in_(composition_filters)
        )

    all_products = query_new.all() + query_product.all()
    total = len(all_products)
    start = (page - 1) * per_page
    end = start + per_page
    products = all_products[start:end]
    pages = (total + per_page - 1) // per_page

    args = request.args.to_dict(flat=True)
    args.pop('page', None)
    return render_template(
        'catalog.html',
        products=products,
        page=page,
        pages=pages,
        args=args,
        request=request,
        categories=categories,
        compositions=compositions, 
        real_min_price=real_min_price,
        real_max_price=real_max_price
    )
@app.route('/test_catalog')
def test_catalog():
    """Тестовый маршрут чтобы проверить передачу переменных"""
    return render_template(
        'catalog.html',
        products=[],
        page=1,
        pages=1,
        args={},
        request=request,
        categories=[],
        real_min_price=7777,
        real_max_price=8888
    )
@app.route('/new')
def new():
    try:
        products = NewProduct.query.all()
        message = None if products else "Товары не найдены"
    except Exception as e:
        message = f"Ошибка при загрузке товаров: {str(e)}"
        products = []
    return render_template('new.html', products=products, message=message)

@app.route('/sale')
def sale():
    try:
        products_on_sale = Product.query.filter(Product.sale > 0).all()
        message = None if products_on_sale else "Нет товаров со скидкой."
    except Exception as e:
        message = f"Ошибка при загрузке товаров: {str(e)}"
        products_on_sale = []
    return render_template('sale.html', products=products_on_sale, message=message)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product_type = request.args.get('product_type')
    if product_type == 'new_product':
        product = NewProduct.query.get_or_404(product_id)
        details = ProductDetails.query.filter_by(new_product_id=product.id).first()
    else:
        product = Product.query.get_or_404(product_id)
        details = ProductDetails.query.filter_by(product_id=product.id).first()
    if not product:
        return "Product not found", 404
    return render_template('product_detail.html', product=product, details=details)

@app.route('/client')
def client():
    return render_template('client.html')

@app.route('/cart')
def cart():
    import json
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)

    total_price = sum(
        (item['price'] * (1 - item.get('sale', 0) / 100)) * item['quantity']
        for item in cart_items.values()
    )

    pending_orders = Order.query.filter_by(status='pending').order_by(Order.created_at.desc()).all()
    processing_orders = Order.query.filter_by(status='processing').order_by(Order.created_at.desc()).all()

    for order in pending_orders:
        try:
            order.cart_data_parsed = json.loads(order.cart_data)
            if not isinstance(order.cart_data_parsed, dict) or "items" not in order.cart_data_parsed:
                order.cart_data_parsed = {"items": []}
        except Exception:
            order.cart_data_parsed = {"items": []}

    return render_template('cart.html',
                           cart=cart_items,
                           total_price=total_price,
                           pending_orders=pending_orders,
                           processing_orders=processing_orders)
@app.route('/make_order', methods=['POST'])
def make_order():
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)
    if not cart_items:
        return redirect(url_for('cart'))

    first_name = request.form.get('firstName')
    last_name = request.form.get('lastName')
    middle_name = request.form.get('middleName')
    phone = request.form.get('phone')
    email = request.form.get('email')

    try:
        order = Order(
            order_id=str(int(time.time())),
            cart_data=json.dumps({'items': list(cart_items.items())}),
            status='pending',
            customer_info=json.dumps({
                'first_name': first_name,
                'last_name': last_name,
                'middle_name': middle_name,
                'phone': phone,
                'email': email
            })
        )
        db.session.add(order)
        db.session.commit()
        response = redirect(url_for('cart'))
        response.set_cookie('cart', '{}', max_age=0)
        return response
    except Exception as e:
        db.session.rollback()
        return "Ошибка при оформлении заказа: " + str(e), 500
    finally:
        db.session.close()

@app.route('/add_to_cart/<product_type>/<int:product_id>')
def add_to_cart(product_type, product_id):
    if product_type == "new":
        product = NewProduct.query.get(product_id)
        sale = 0  # У NewProduct нет поля sale
    else:
        product = Product.query.get(product_id)
        sale = getattr(product, 'sale', 0)
    if not product:
        return "Товар не найден", 404

    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)
    cart_key = f"{product_type}_{product_id}"

    if cart_key in cart_items:
        cart_items[cart_key]['quantity'] += 1
    else:
        cart_items[cart_key] = {
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'sale': sale,
            'quantity': 1,
            'image_url': product.image_url,
            'product_type': product_type,
            'product_id': product_id
        }
    resp = make_response(redirect(url_for('cart')))
    resp.set_cookie('cart', json.dumps(cart_items), max_age=365*24*60*60)
    return resp

@app.route('/remove_from_cart/<product_key>')
def remove_from_cart(product_key):
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)
    if product_key in cart_items:
        del cart_items[product_key]
    resp = make_response(redirect(url_for('cart')))
    resp.set_cookie('cart', json.dumps(cart_items), max_age=365*24*60*60)
    return resp

def get_cart_item_count():
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)
    return sum(item['quantity'] for item in cart_items.values())

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')
@app.context_processor
def inject_cart_item_count():
    try:
        count = get_cart_item_count()
    except Exception:
        count = 0
    return dict(cart_item_count=count)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)