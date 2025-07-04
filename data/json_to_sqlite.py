#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
诗词数据导入脚本
将data/raw目录下的JSON格式诗词数据导入SQLite数据库
"""

import json
import sqlite3
import os
from pathlib import Path
from typing import List, Dict, Any


def create_database(db_path: str) -> sqlite3.Connection:
    """
    创建SQLite数据库和表结构
    
    Args:
        db_path: 数据库文件路径
        
    Returns:
        数据库连接对象
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 创建诗词表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS poetry (
            poetry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            title TEXT NOT NULL
        )
    """)
    
    # 创建句子表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sentence (
            sentence_id INTEGER PRIMARY KEY AUTOINCREMENT,
            poetry_id INTEGER NOT NULL,
            poetry_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY (poetry_id) REFERENCES poetry (poetry_id)
        )
    """)
    
    # 创建索引以提高查询性能
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_sentence_id ON sentence (sentence_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_poetry_id ON sentence (poetry_id)
    """)
    
    conn.commit()
    return conn


def load_json_files(raw_data_dir: str) -> List[Dict[str, Any]]:
    """
    加载raw目录下的所有JSON文件
    
    Args:
        raw_data_dir: 原始数据目录路径
        
    Returns:
        所有诗词数据的列表
    """
    all_poetry_data = []
    raw_path = Path(raw_data_dir)
    
    # 遍历所有JSON文件
    for json_file in raw_path.glob('*.json'):
        print(f"正在处理文件: {json_file.name}")
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    all_poetry_data.extend(data)
                else:
                    all_poetry_data.append(data)
        except Exception as e:
            print(f"处理文件 {json_file.name} 时出错: {e}")
            continue
    
    return all_poetry_data


def import_poetry_data(conn: sqlite3.Connection, poetry_data: List[Dict[str, Any]]) -> None:
    """
    将诗词数据导入数据库
    
    Args:
        conn: 数据库连接对象
        poetry_data: 诗词数据列表
    """
    cursor = conn.cursor()
    
    for poetry in poetry_data:
        try:
            # 插入诗词基本信息
            cursor.execute("""
                INSERT INTO poetry (author, title) VALUES (?, ?)
            """, (poetry['author'], poetry['title']))
            
            # 获取刚插入的诗词ID
            poetry_id = cursor.lastrowid
            
            # 插入诗词的每一句
            paragraphs = poetry.get('paragraphs', [])
            for index, sentence in enumerate(paragraphs):
                cursor.execute("""
                    INSERT INTO sentence (poetry_id, poetry_index, content) 
                    VALUES (?, ?, ?)
                """, (poetry_id, index, sentence))
            
            print(f"已导入: {poetry['author']} - {poetry['title']} ({len(paragraphs)}句)")
            
        except Exception as e:
            print(f"导入诗词时出错 {poetry.get('title', 'Unknown')}: {e}")
            continue
    
    conn.commit()


def main():
    """
    主函数
    """
    # 设置路径
    script_dir = Path(__file__).parent
    raw_data_dir = script_dir / 'raw'
    db_path = script_dir / 'poetry.db'
    
    print(f"原始数据目录: {raw_data_dir}")
    print(f"数据库路径: {db_path}")
    
    # 检查原始数据目录是否存在
    if not raw_data_dir.exists():
        print(f"错误: 原始数据目录 {raw_data_dir} 不存在")
        return
    
    try:
        # 创建数据库和表
        print("正在创建数据库和表结构...")
        conn = create_database(str(db_path))
        
        # 加载JSON数据
        print("正在加载JSON数据文件...")
        poetry_data = load_json_files(str(raw_data_dir))
        print(f"共加载 {len(poetry_data)} 首诗词")
        
        # 导入数据
        print("正在导入数据到数据库...")
        import_poetry_data(conn, poetry_data)
        
        # 统计导入结果
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM poetry")
        poetry_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM sentence")
        sentence_count = cursor.fetchone()[0]
        
        print(f"\n导入完成!")
        print(f"诗词总数: {poetry_count}")
        print(f"句子总数: {sentence_count}")
        
        conn.close()
        
    except Exception as e:
        print(f"执行过程中出错: {e}")
        if 'conn' in locals():
            conn.close()


if __name__ == '__main__':
    main()