#!/usr/bin/env python3
import csv
import json

csv_path = '/Users/rashpinderkaur/Desktop/marketpulse_backup_20241109/backend/knowledge/jewellery_knowledge_base.csv'

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    competitors_sql = []
    locations_sql = []
    
    for row in reader:
        comp_name = row['competitor_name'].replace("'", "''")
        metal = (row['metal'] or 'unknown').replace("'", "''")
        use_cat = (row['use_category'] or 'General').replace("'", "''")
        region = (row['region'] or 'unknown').replace("'", "''")
        biz_type = (row['business_type'] or 'Showroom').replace("'", "''")
        price = (row['price_positioning'] or 'unknown').replace("'", "''")
        national = 'true' if row['national_chain_presence'] == 'Yes' else 'false'
        website = f"'{row['website'].replace(\"'\", \"''\")}'" if row['website'] else 'NULL'
        insta = f"'{row['instagram_handle'].replace(\"'\", \"''\")}'" if row['instagram_handle'] else 'NULL'
        fb = f"'{row['facebook_account'].replace(\"'\", \"''\")}'" if row['facebook_account'] else 'NULL'
        
        city = (row['city'] or 'Unknown').replace("'", "''")
        state = (row['state'] or 'Unknown').replace("'", "''")
        locality = f"'{row['locality'].replace(\"'\", \"''\")}'" if row['locality'] else 'NULL'
        store_count = row['store_count'] if row['store_count'] and row['store_count'].isdigit() else '1'
        branch_count = row['branch_count'] if row['branch_count'] and row['branch_count'].isdigit() else '0'
        
        competitors_sql.append(
            f"('{comp_name}', '{metal}', '{use_cat}', '{region}', '{biz_type}', '{price}', {national}, {website}, {insta}, {fb})"
        )
        
        locations_sql.append({
            'comp_name': comp_name,
            'city': city,
            'state': state,
            'locality': locality,
            'store_count': store_count,
            'branch_count': branch_count
        })
    
    # Print INSERT statements in batches
    print("-- Insert competitors")
    print("INSERT INTO competitors (competitor_name, metal, use_category, region, business_type, price_positioning, national_chain, website, instagram_handle, facebook_account)")
    print("VALUES")
    print(",\n".join(competitors_sql[:100]))  # First 100
    print("ON CONFLICT (competitor_name) DO NOTHING;")
    
    print("\n\n-- Locations will be added after competitors")
    print(f"-- Total: {len(competitors_sql)} competitors, {len(locations_sql)} locations")



