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


def load_json_files_chinese_poetry(raw_data_dir: str) -> List[Dict[str, Any]]:
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


def load_tang_300_data(tang_300_file: str) -> List[Dict[str, Any]]:
    """
    加载 tang-300 数据源的诗词数据
    
    Args:
        tang_300_file: tang-300 数据文件路径
        
    Returns:
        转换后的诗词数据列表
    """
    poetry_data = []
    
    try:
        with open(tang_300_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for item in data:
            # 将 contents 按 \n 分割成 paragraphs
            paragraphs = item['contents'].split('\n')
            # 过滤空行
            paragraphs = [p.strip() for p in paragraphs if p.strip()]
            
            # 转换为统一格式
            poetry_item = {
                'author': item['author'],
                'title': item['title'],
                'paragraphs': paragraphs
            }
            poetry_data.append(poetry_item)
            
        print(f"tang-300 数据源加载完成，共 {len(poetry_data)} 首诗词")
        
    except Exception as e:
        print(f"加载 tang-300 数据时出错: {e}")
        
    return poetry_data


def load_chinese_poetry_refined_data(refined_data_dir: str) -> List[Dict[str, Any]]:
    """
    加载 chinese-poetry-refined 数据源的诗词数据
    
    Args:
        refined_data_dir: chinese-poetry-refined 数据目录路径
        
    Returns:
        转换后的诗词数据列表
    """
    poetry_data = []
    refined_path = Path(refined_data_dir)
    
    # 遍历所有JSON文件
    for json_file in refined_path.glob('*.json'):
        print(f"正在处理文件: {json_file.name}")
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if isinstance(data, list):
                for item in data:
                    # 将 content 按 \n 分割成 paragraphs
                    paragraphs = item['content'].split('\n')
                    # 过滤空行
                    paragraphs = [p.strip() for p in paragraphs if p.strip()]
                    
                    # 转换为统一格式
                    poetry_item = {
                        'author': item['author'],
                        'title': item['title'],
                        'paragraphs': paragraphs
                    }
                    poetry_data.append(poetry_item)
            else:
                # 单个对象的情况
                paragraphs = data['content'].split('\n')
                paragraphs = [p.strip() for p in paragraphs if p.strip()]
                
                poetry_item = {
                    'author': data['author'],
                    'title': data['title'],
                    'paragraphs': paragraphs
                }
                poetry_data.append(poetry_item)
                
        except Exception as e:
            print(f"处理文件 {json_file.name} 时出错: {e}")
            continue
    
    print(f"chinese-poetry-refined 数据源加载完成，共 {len(poetry_data)} 首诗词")
    return poetry_data


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
    db_path = script_dir / 'poetry.db'

    print(f"数据库路径: {db_path}")
    
    try:
        # 删除现有数据库文件（如果存在）
        if db_path.exists():
            print(f"删除现有数据库文件: {db_path}")
            db_path.unlink()
        
        # 创建数据库和表
        print("正在创建数据库和表结构...")
        conn = create_database(str(db_path))
        
        # 加载JSON数据
        poetry_data = []

        # 加载 chinese-poetry 数据源的诗词
        # chinese_poetry_data_file = script_dir / 'raw' / 'chinese-poetry' / 'chinese-poetry.json'
        # if chinese_poetry_data_file.exists():
        #     print("正在加载JSON数据文件（chinese-poetry）...")
        #     poetry_data.extend(load_json_files_chinese_poetry(str(chinese_poetry_data_file)))
        #     print(f"共加载 {len(poetry_data)} 首诗词")
        # else:
        #     print(f"警告: chinese-poetry 数据文件 {chinese_poetry_data_file} 不存在")

        # 加载 tang-300 数据源的诗词
        # tang_300_file = script_dir / 'raw' / 'tang-300' / '300.json'
        # if tang_300_file.exists():
        #     print("正在加载 tang-300 数据源...")
        #     poetry_data.extend(load_tang_300_data(str(tang_300_file)))
        # else:
        #     print(f"警告: tang-300 数据文件 {tang_300_file} 不存在")

        # 加载 chinese-poetry-refined 数据源的诗词
        refined_data_dir = script_dir / 'raw' / 'chinese-poetry-refined'
        if refined_data_dir.exists():
            print("正在加载 chinese-poetry-refined 数据源...")
            poetry_data.extend(load_chinese_poetry_refined_data(str(refined_data_dir)))
        else:
            print(f"警告: chinese-poetry-refined 数据目录 {refined_data_dir} 不存在")


        
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