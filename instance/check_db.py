import sqlite3

conn = sqlite3.connect('product.db')
cursor = conn.cursor()

print("=== СПИСОК ТАБЛИЦ ===")
tables = cursor.execute("""
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
""").fetchall()

for t in tables:
    print(t[0])

print("\n=== ПОДРОБНАЯ СТРУКТУРА ТАБЛИЦ ===")

table_list = ['category', 'product', 'product_details', 'product_variant', 'product_category', 'order']

for table in table_list:
    print(f"\n--- Таблица: {table.upper()} ---")
    
    # Колонки
    cursor.execute(f"PRAGMA table_info({table});")
    columns = cursor.fetchall()
    for col in columns:
        pk = "PK" if col[5] else ""
        print(f"  {col[1]:<20} {col[2]:<12} {pk}")
    
    # Внешние ключи
    cursor.execute(f"PRAGMA foreign_key_list({table});")
    fks = cursor.fetchall()
    if fks:
        print("  Внешние ключи:")
        for fk in fks:
            print(f"    {fk[3]:<15} → {fk[2]}.{fk[4]}")

conn.close()
print("\nГотово!")