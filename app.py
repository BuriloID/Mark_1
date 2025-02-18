
from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)
# Настройки для базы данных
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///product.db'  # Путь к базе данных

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
    category = request.args.get('category')  # Получаем категорию из параметра запроса
    if category:
        products = Product.query.filter_by(category=category).all()  # Фильтруем по категории
    else:
        products = Product.query.all()  # Показываем все товары, если категории нет
    return render_template('catalog.html', products=products, selected_category=category)
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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Создаём все таблицы
    app.run(debug=True)



