import telebot
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime
import os
import smtplib
from email.mime.text import MIMEText

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

def send_email(to_email, subject, body):
    smtp_host = 'smtp.yandex.ru'  # или smtp.gmail.com и т.д.
    smtp_port = 465
    smtp_user = 'cool.danchik29@yandex.ru'
    smtp_pass = 'kjtrsklvkjkjlbdm'  
    msg = MIMEText(body, "plain", "utf-8")
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = to_email
    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, [to_email], msg.as_string())
@bot.callback_query_handler(func=lambda call: call.data.startswith("start_"))
def callback_start_order(call):
    order_id = call.data.replace("start_", "")
    session = Session()
    order = session.query(Order).filter_by(order_id=order_id).first()
    if order:
        order.status = "processing"
        session.commit()
         # --- Получить e-mail покупателя ---
        try:
            info = json.loads(order.customer_info)
            email = info.get("email")
            first_name = info.get("first_name", "")
        except Exception:
            email = None
            first_name = ""
        # --- Отправить письмо ---
        if email:
            print(f"Пробуем отправить письмо: email={email}, order_id={order_id}")
            try:
                send_email(
                    email,
                    subject="Ваш заказ принят в работу",
                    body=f"Здравствуйте{', ' + first_name if first_name else ''}! Ваш заказ №{order_id} принят в работу. Мы свяжемся с вами в ближайшее время."
                )
            except Exception as e:
                print(f"Ошибка отправки email: {e}")
        # --- Стандартное сообщение в боте ---
        bot.edit_message_reply_markup(call.message.chat.id, call.message.message_id, reply_markup=None)
        bot.answer_callback_query(call.id, "Заказ принят и находится в работе!")
    else:
        bot.answer_callback_query(call.id, "Заказ не найден!", show_alert=True)
    session.close()

bot.polling(none_stop=True)