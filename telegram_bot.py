import telebot
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime
import os

TOKEN = "7879922019:AAFKrDUzrPBAUqbZN0BudsTySC3C1g3MelY"
bot = telebot.TeleBot(TOKEN)

# Укажи путь к базе, как во Flask
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "instance", "product.db")
engine = create_engine(f"sqlite:///{DB_PATH}")

Session = sessionmaker(bind=engine)
Base = declarative_base()

# Минимальное определение модели Order
class Order(Base):
    __tablename__ = 'Order'  # Важно: имя таблицы как во Flask!
    id = Column(Integer, primary_key=True)
    order_id = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default='pending')
    cart_data = Column(Text, nullable=False)
    customer_info = Column(Text, nullable=False)
    created_at = Column(DateTime)

@bot.callback_query_handler(func=lambda call: call.data.startswith("start_"))
def callback_start_order(call):
    order_id = call.data.replace("start_", "")
    session = Session()
    order = session.query(Order).filter_by(order_id=order_id).first()
    if order:
        order.status = "processing"
        session.commit()
        bot.edit_message_reply_markup(call.message.chat.id, call.message.message_id, reply_markup=None)
        bot.answer_callback_query(call.id, "Заказ принят и находится в работе!")
    else:
        bot.answer_callback_query(call.id, "Заказ не найден!", show_alert=True)
    session.close()

bot.polling(none_stop=True)