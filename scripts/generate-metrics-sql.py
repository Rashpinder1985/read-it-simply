#!/usr/bin/env python3
import csv
import sys

CSV_PATH = '/Users/rashpinderkaur/Desktop/marketpulse_backup_20241109/backend/knowledge/jewellery_knowledge_base.csv'

print("-- Import ALL competitor metrics from CSV")
print("-- Generated metrics for all 595 competitors")
print("-- Run this in Supabase SQL Editor\n")

with open(CSV_PATH, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    batch = []
    count = 0
    
    for row in reader:
        name = row['competitor_name'].replace("'", "''")
        rating = row['rating_avg'] if row['rating_avg'] else 'NULL'
        reviews = row['review_count'] if row['review_count'] else 'NULL'
        presence = row['market_presence_label'].replace("'", "''") if row['market_presence_label'] else 'NULL'
        
        if rating != 'NULL' or reviews != 'NULL':
            if presence != 'NULL':
                presence = f"'{presence}'"
            
            sql_line = f"SELECT c.id, CURRENT_DATE, {rating}, {reviews}, {presence}, 'last_90_days' FROM competitors c WHERE c.competitor_name = '{name}'"
            batch.append(sql_line)
            count += 1
            
            # Insert in batches of 50
            if len(batch) == 50:
                print("INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)")
                print(batch[0])
                for line in batch[1:]:
                    print("UNION ALL")
                    print(line)
                print("ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE")
                print("SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;")
                print()
                batch = []
    
    # Insert remaining batch
    if batch:
        print("INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)")
        print(batch[0])
        for line in batch[1:]:
            print("UNION ALL")
            print(line)
        print("ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE")
        print("SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;")
        print()
    
    print(f"-- Total metrics to import: {count}")



