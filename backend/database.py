import sqlite3

conn = sqlite3.connect("chat.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    query TEXT,
    response TEXT
)
""")

def save_chat(user, query, response):
    cursor.execute(
        "INSERT INTO chats (user, query, response) VALUES (?, ?, ?)",
        (user, query, response)
    )
    conn.commit()

def get_chats(user):
    cursor.execute(
        "SELECT query, response FROM chats WHERE user=?",
        (user,)
    )
    return cursor.fetchall()