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
from dotenv import load_dotenv
import os
import cloudinary
import traceback

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
CORS(app)

# Токен и чат
TOKEN = os.getenv("BOT_TOKEN")
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


class Order(db.Model):
    __tablename__ = 'order'          # ← Это обязательно!

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)
    status = db.Column(db.String(20), default='pending')
    cart_data = db.Column(db.Text, nullable=False)
    customer_info = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def __repr__(self):
        return f'<Order {self.order_id}>'

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)   
    title = db.Column(db.String(100), nullable=False)             

    def __repr__(self):
        return f'<Category {self.name}>'


class Product(db.Model):
    __tablename__ = 'product'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    image_url_back = db.Column(db.String(500), nullable=True)
    sale = db.Column(db.Float, default=0.0)
    product_type = db.Column(db.String(20), default='regular')

    categories = db.relationship('Category', secondary=product_category, backref='products')
    
    # Исправленные отношения
    details = db.relationship('ProductDetails', back_populates='product', lazy=True)
    variants = db.relationship('ProductVariant', back_populates='product', lazy=True)

    def __repr__(self):
        return f'<Product {self.name}>'
class ProductDetails(db.Model):
    __tablename__ = 'product_details'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)

    full_description = db.Column(db.Text, nullable=True)
    composition = db.Column(db.Text, nullable=True)
    size = db.Column(db.Text, nullable=True)
    extra_image1 = db.Column(db.String(500), nullable=True)
    extra_image2 = db.Column(db.String(500), nullable=True)
    extra_image3 = db.Column(db.String(500), nullable=True)
    extra_image4 = db.Column(db.String(500), nullable=True)
    extra_image5 = db.Column(db.String(500), nullable=True)
    extra_image6 = db.Column(db.String(500), nullable=True)

    product = db.relationship('Product', back_populates='details')

    def __repr__(self):
        return f'<ProductDetails {self.id}>'
class ProductVariant(db.Model):
    __tablename__ = 'product_variant'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    
    color = db.Column(db.String(100), nullable=False)
    main_image = db.Column(db.String(500))
    image_extra1 = db.Column(db.String(500))
    image_extra2 = db.Column(db.String(500))
    image_extra3 = db.Column(db.String(500))
    image_extra4 = db.Column(db.String(500))
    image_extra5 = db.Column(db.String(500))
    image_extra6 = db.Column(db.String(500))
    color_hex = db.Column(db.String(20), nullable=True)

    # Исправленное отношение
    product = db.relationship('Product', back_populates='variants')

    def __repr__(self):
        return f'<ProductVariant {self.id}>'
    

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
    color = request.form.get('selectedColor')
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
            color = request.form.get('selectedColor', 'Не указан')
            message += f"📦 Товар: {product_name}"
            
            if color and color != 'Не указан':
                message += f" — {color}"          
            
            message += f" ({product_descriptions})\n"
            message += f"💰 Цена: {product_price} ₽\n"
            
            if product_url:
                message += f"🔗 Ссылка: {product_url}\n"
                
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
    try:
        data = request.get_json() or {}

        min_price = data.get('min_price')
        max_price = data.get('max_price')
        compositions = data.get('compositions', [])
        categories = data.get('categories', [])

        # ==================== ОСНОВНОЙ ЗАПРОС ====================
        query = Product.query.join(Product.details, isouter=True)

        # Фильтры
        if min_price is not None:
            query = query.filter(Product.price >= float(min_price))
        if max_price is not None:
            query = query.filter(Product.price <= float(max_price))
        if categories:
            query = query.filter(Product.categories.any(Category.name.in_(categories)))

        # Сортировка
        query = query.order_by(
            db.case((Product.product_type == 'new', 1), else_=2),
            Product.id.desc()
        )

        # ==================== ФИЛЬТР ПО СОСТАВУ ====================
        if compositions:
            # Более эффективный способ
            query = query.filter(
                ProductDetails.composition.isnot(None),
                or_(*[ProductDetails.composition.ilike(f"%{comp}%") for comp in compositions])
            )

        products = query.all()

        # ==================== ФОРМИРОВАНИЕ HTML ====================
        products_html = ""
        for product in products:
            is_new = product.product_type == 'new'

            # Изображения (Cloudinary)
            main_img = product.image_url or "https://via.placeholder.com/400x500"
            image_html = f'<img src="{main_img}" class="main-img" alt="{product.name}">'
            
            if product.image_url_back:
                image_html += f'<img src="{product.image_url_back}" class="hover-img" alt="{product.name}">'

            # Состав
            composition_html = ""
            if product.details and product.details[0].composition:
                composition_html = f'''
                    <p class="product-composition">
                        <small>{product.details[0].composition}</small>
                    </p>
                '''

            products_html += f'''
            <a href="{url_for('product_detail', product_id=product.id)}">
                <div class="product">
                    {'<div class="new-label">New</div>' if is_new else ''}
                    <div class="product-images">
                        {image_html}
                    </div>
                    <div class="product-content">
                        <h3>{product.description or ""}</h3>
                        {composition_html}
                        <p class="price">от {int(product.price)}</p>
                    </div>
                </div>
            </a>
            '''

        if not products_html:
            products_html = '<p class="no-products">Товары не найдены по выбранным фильтрам</p>'

        # Все составы для фильтра
        all_compositions = [c[0] for c in db.session.query(ProductDetails.composition)
                            .filter(ProductDetails.composition.isnot(None))
                            .distinct().all() if c[0]]

        return jsonify({
            'success': True,
            'products_html': products_html,
            'products_count': len(products),
            'compositions': sorted(all_compositions)
        })

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500
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
        products = (
    Product.query
    .filter(Product.product_type == 'new')
    .order_by(Product.id.desc())
    .limit(4)
    .all()
)
        message = None if products else "Товары не найдены"
    except Exception as e:
        message = f"Ошибка при загрузке товаров: {str(e)}"
        products = []
        collections = []
    return render_template('index.html', products=products, message=message)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/catalog')
def catalog():
    # Параметры из URL
    page = request.args.get('page', 1, type=int)
    per_page = 16

    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    category_name = request.args.get('category')
    search_query = request.args.get('search')
    composition_filters = request.args.getlist('composition')

    # Получаем все категории для фильтра
    categories = Category.query.all()

    # Получаем все уникальные составы для фильтра
    compositions_query = db.session.query(ProductDetails.composition)\
        .filter(ProductDetails.composition.isnot(None))\
        .filter(ProductDetails.composition != '')\
        .distinct()\
        .order_by(ProductDetails.composition)
    
    compositions = [c[0] for c in compositions_query.all() if c[0]]

    # --- Цены ---
    min_price_db = db.session.query(db.func.min(Product.price)).scalar() or 0
    max_price_db = db.session.query(db.func.max(Product.price)).scalar() or 0

    real_min_price = int(min_price_db)
    real_max_price = int(max_price_db) + 100 if max_price_db > 0 else 10000

    # --- Основной запрос товаров ---
    query = Product.query.join(Product.details, isouter=True)  # LEFT JOIN на детали

    # Применяем фильтры
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if category_name:
        query = query.filter(Product.categories.any(Category.name == category_name))

    if search_query:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search_query}%"),
                Product.description.ilike(f"%{search_query}%")
            )
        )

    if composition_filters:
        query = query.filter(
            ProductDetails.composition.in_(composition_filters)
        )

    # Сортировка: новые товары сверху
    query = query.order_by(
        db.case((Product.product_type == 'new', 1), else_=2),
        Product.id.desc()
    )

    # Пагинация
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    products = pagination.items

    # Для сохранения фильтров при переключении страниц
    args = {k: v for k, v in request.args.to_dict(flat=True).items() if k != 'page'}

    return render_template(
        'catalog.html',
        products=products,
        page=page,
        pages=pagination.pages,  
        args=args,
        categories=categories,
        compositions=compositions,
        real_min_price=real_min_price,
        real_max_price=real_max_price
    )
@app.route('/new')
def new():
    try:
        products = Product.query.filter_by(product_type='new').all()
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
    product = Product.query.get_or_404(product_id)
    details = ProductDetails.query.filter_by(product_id=product.id).first()
    variants = ProductVariant.query.filter_by(product_id=product.id).all()
    if not product:
        return "Product not found", 404
    return render_template('product_detail.html', product=product, details=details, variants=variants)

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


    return render_template('cart.html',
                           cart=cart_items,
                           total_price=total_price)
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
        response = redirect(
            url_for(
                'order_success',
                order_id=order.order_id
            )
        )
        response.set_cookie('cart', '{}', max_age=0)
        return response
    except Exception as e:
        db.session.rollback()
        return "Ошибка при оформлении заказа: " + str(e), 500
    finally:
        db.session.close()
@app.route('/add_to_cart/<string:product_type>/<int:product_id>')
def add_to_cart(product_type, product_id):
    product = Product.query.get_or_404(product_id)
    
    # Получаем текущую корзину
    cart_cookie = request.cookies.get('cart', '{}')
    cart_items = json.loads(cart_cookie)
    
    cart_key = f"{product_type}_{product_id}"

    if cart_key in cart_items:
        cart_items[cart_key]['quantity'] += 1
        message = "Количество товара увеличено"
    else:
        cart_items[cart_key] = {
            'name': product.name,
            'description': product.description or "",
            'price': float(product.price),
            'sale': float(getattr(product, 'sale', 0)),
            'quantity': 1,
            'image_url': product.image_url,
            'product_type': product_type,
            'product_id': product_id
        }
        message = "Товар добавлен в корзину"

    # Сохраняем корзину
    resp = make_response(jsonify({
        'success': True,
        'message': message,
        'cart_count': sum(item['quantity'] for item in cart_items.values())
    }))
    
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
