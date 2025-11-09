#!/usr/bin/env python3
import csv
import sys

CSV_PATH = '/Users/rashpinderkaur/Desktop/marketpulse_backup_20241109/backend/knowledge/jewellery_knowledge_base.csv'

print("-- Import ALL competitor metrics from CSV (FIXED - No Duplicates)")
print("-- Generated metrics for unique competitors only")
print("-- Run this in Supabase SQL Editor\n")

with open(CSV_PATH, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    # Use a dictionary to store unique competitors (last entry wins)
    competitors_dict = {}
    
    for row in reader:
        name = row['competitor_name']
        rating = row['rating_avg'] if row['rating_avg'] else 'NULL'
        reviews = row['review_count'] if row['review_count'] else 'NULL'
        presence = row['market_presence_label'].replace("'", "''") if row['market_presence_label'] else 'NULL'
        
        if rating != 'NULL' or reviews != 'NULL':
            if presence != 'NULL':
                presence = f"'{presence}'"
            
            # Store only unique competitor (will keep the last occurrence)
            competitors_dict[name] = {
                'name': name.replace("'", "''"),
                'rating': rating,
                'reviews': reviews,
                'presence': presence
            }
    
    # Now insert in batches
    competitors_list = list(competitors_dict.values())
    batch_size = 50
    total_count = len(competitors_list)
    
    print(f"-- Total unique competitors with metrics: {total_count}\n")
    
    for i in range(0, total_count, batch_size):
        batch = competitors_list[i:i + batch_size]
        
        print("INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)")
        
        for j, comp in enumerate(batch):
            sql_line = f"SELECT c.id, CURRENT_DATE, {comp['rating']}, {comp['reviews']}, {comp['presence']}, 'last_90_days' FROM competitors c WHERE c.competitor_name = '{comp['name']}'"
            
            if j == 0:
                print(sql_line)
            else:
                print("UNION ALL")
                print(sql_line)
        
        print("ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE")
        print("SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;")
        print()
    
    print(f"-- Total unique metrics to import: {total_count}")

