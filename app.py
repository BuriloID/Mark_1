
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)
# Настройки для базы данных
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///product.db'  # Путь к базе данных
app.config['SECRET_KEY'] = 'supersecretkey'  # Ключ для работы сессий

db = SQLAlchemy(app)
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # id товара
    name = db.Column(db.String(100), nullable=False)  # Название товара
    description = db.Column(db.String(500), nullable=True)  # Описание товара
    price = db.Column(db.Float, nullable=False)  # Цена товара
    image_url = db.Column(db.String(500), nullable=True)  # Ссылка на изображение
    image_url_back = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(50), nullable=False)  # Поле категории товара
    # Связь с таблицей ProductDetails
    details = db.relationship('ProductDetails', backref='product', lazy=True)
    def __repr__(self):
        return f'<Product {self.name}>'
class ProductDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
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
    return render_template('index.html')
@app.route('/about')
def about():
    return render_template('about.html')
@app.route('/catalog')
def catalog():
    name = request.args.get('name')
    category = request.args.get('category')  # Получаем категорию из параметра запроса
    query = Product.query  # Начинаем с базового запроса
    if category:
        query = query.filter_by(category=category)  # Фильтруем по категории
    if name:
        query = query.filter_by(name=name)  # Фильтруем по названию товара
    products = query.all()  # Выполняем запрос
    return render_template('catalog.html', products=products, selected_category=category, selected_name=name)
@app.route('/product/<int:product_id>')
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    details = ProductDetails.query.filter_by(product_id=product_id).first()  # Берем доп. данные
    return render_template('product_detail.html', product=product, details=details)
@app.route('/new')
def new():
    return render_template('new.html')
@app.route('/client')
def client():
    return render_template('client.html')
@app.route('/cart')
def cart():
    cart_items = session.get('cart', {})
    total_price = sum(item['price'] * item['quantity'] for item in cart_items.values())
    return render_template('cart.html', cart=cart_items, total_price=total_price)
@app.route('/add_to_cart/<int:product_id>')
def add_to_cart(product_id):
    product = Product.query.get_or_404(product_id)
    cart = session.get('cart', {})
    if str(product_id) in cart:
        cart[str(product_id)]['quantity'] += 1
    else:
        cart[str(product_id)] = {
            'name': product.name,
            'price': product.price,
            'quantity': 1,
            'image_url': product.image_url
        }
    session['cart'] = cart
    return redirect(url_for('cart'))
@app.route('/remove_from_cart/<int:product_id>')
def remove_from_cart(product_id):
    cart = session.get('cart', {})
    if str(product_id) in cart:
        del cart[str(product_id)]
    session['cart'] = cart
    return redirect(url_for('cart'))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Создаём все таблицы
    app.run(debug=True)



