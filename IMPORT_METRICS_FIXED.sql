-- Import ALL competitor metrics from CSV (FIXED - No Duplicates)
-- Generated metrics for unique competitors only
-- Run this in Supabase SQL Editor

-- Total unique competitors with metrics: 523

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.40, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Akshaara Beautyhub'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gurudatha Gold Marchent'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 313, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jayanthi Diamonds & Jewellers Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Lakshmi Tirumala Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'SRI LAKSHMI NARASIMHA GOLD WORKS'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 63, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sree Sai Rajendra Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 178, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Girija Shankar Selections'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Varalaxmi Jewellery & Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 16, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Venkateswara Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'ARNIKA SILVER JEWELLERY'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 176, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bombay Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 420, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Indriya'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 20, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kiranmayi Jewellery Mart'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 32, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mahendra Jewellery House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 75, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rajendra Jewellers Wholesale Gold Shoppe'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 51, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Sanghvi Jewellers INDIA Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 100, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sridevi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 3541, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vega Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 114, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vishal Silver'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 124, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kila Silver Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'S J Gold Refinery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 163, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Satyasri 1 Gram Jewellery & Fancy'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 120, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Kameswari Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Shakti Dharmakata'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 159, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Srinivasa Chaitanya Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Srinivasa Gold Refinery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 373, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swarna Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 151, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vysyaraju Raju Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Yamini Silver Ware'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Arunachal Ivory And Ornaments'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Asb Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Asmi Diamonds'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 26, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Itanagar Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Melorra Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.40, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'R.J Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.20, 7, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rani Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 74, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Reliance jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.00, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Siyaram Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Star Gems House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 153, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Balaji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 495, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Blue Stone'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 836, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Caratlane'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 155, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'D N Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 79, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gold Place Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 115, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jyoti Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Prakash Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 127, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rajasthan Gems & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 70, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Royal Gems & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 2355, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Tanishq'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'ARCHNEH JEWELLERS'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.30, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Geetanjali Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 19, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Maa Anjali Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 7, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'N B Gems & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 22, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Nath Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 601, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rattnanjalee Jewel India Pvt. Ltd.'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 196, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rupashree Assamese Traditional Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Samrat Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.60, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shippan Gold Smith Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 217, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Zangfai'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bhargavi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gopal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 157, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jainam Ornament Pvt. Ltd.'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 415, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jewar Mahal'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 1243, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kalyan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 29, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Khazaana Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 477, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kisna Diamond & Gold Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 200, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'PC Jeweller Ltd.'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 42, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Tibetan Handicraft'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Alankar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 33, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bhushan Bhandar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 183, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'JJ Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 49, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jyoti Alankar'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 290, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kasturi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 753, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'RADHE KRISHNA JEWELLERS'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 119, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ratnapriya Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 365, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sevika Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 1886, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Kanak Dhara Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.60, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anjalii Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Clt Annmol Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 7, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Navratan Gems & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 36, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rakesh Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 88, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'SATI SHREE Jewellers & GEMS'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 82, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shah Jawaharlal Jethalal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 18, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sherlin Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 30, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Khatu Shyam Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 99, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Leela Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 32, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shubhkamana Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 1361, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anopchand Tilokchand Jewellers Flagship Store'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 1257, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anopchand Tilokchand Jewellers Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 1361, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anopchand Tilokchand Jewellers Pvt.Ltd.'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'J.J.Gems & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 63, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jewellers Sonia Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 129, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Navkar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 51, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Samriddhi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 19, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shah Jethalal Jadavji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 36, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Al Hamd Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 37, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Arihant Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 1401, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Femina Gold Palace'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 261, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Heritage Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 30492, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kalamandir Jewellers Limited'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.70, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Omkar Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 126, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Param Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 5680, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Tanishq Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anil Silvers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 19, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anmol Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 72, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bhalchandra Govind Mirkar & Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jai Ambika Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jyotirling Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 129, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kanchan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 91, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Meghna Jewellers Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 54, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vishal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 21, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Arihant Gold Palace'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gharena Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 35, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Himatlal T Patadia Gems & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 17930, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kalamandir Jewellers Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 148, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'M C Zaveri'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 20, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sonamahal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 15, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swastik Imitation'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 2335, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vinayak Gold Palace'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 745, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Aditya Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 83, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Dhanraj Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 24, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jupiter Lifestyle Pvt. Ltd.,Jupiter Lifestyle'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 38, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Oms Group'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 109, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Popular Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 15, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Sai Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 29, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Tulja Jewellers Dholrawala'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 72, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Amrut Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 617, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Soni Fashion'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 16, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vagheshvari Gold Art'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 319, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Amideep Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 967, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Charu Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 303, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Divera Diamond Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 833, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Indriya (Arihant Mall)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 9506, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'KHUSHALBHAI Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 27, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Navinchandra Hirachand Malji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 37, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Palaksh Jewelry'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'R S Sakhiya Diamond'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 50, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swarna Kalash Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 52, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swastik Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 38, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'The Creative Box'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 1095, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Zota Jewel'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 1207, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Arbuda Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 319, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ashapuri Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 48, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Baroda Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 46, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Maa Ashapuri Silver House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 64, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mevada Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 633, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'N K Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 18, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Nandlal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 33, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Parovani Point'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 468, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Radhika Jewellers'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.80, 378, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'B.L & Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 81, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chand Gems And Jewellery Pvt. Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 154, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Durga Gold and Silver House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 632, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Giva - Faridabad - Sector 15'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 99, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jauhreez - Agarwal Abhushan Bhandar'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 2113, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Prabhu Dayal & Sons Jewellers Pvt Ltd. (Since 1967)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 24, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swastik Shree Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 21, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'A D Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 422, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Aashirwad Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 75, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Dhirsons Jewellery House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jiyo Created Diamonds & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 487, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Naresh Jewellers Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 583, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'P P Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 97, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Prabhu Dayal Malhotra & Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 3925, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Giriraj Jewellers Since 2002'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 271, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Raghuveer Jeweller Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 54, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Aakash Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 1997, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Fateh Chand Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 299, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kiner Kailash Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 230, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Lal Jee Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 264, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ratra Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 2616, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Tangri Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1300, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Verma Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 1280, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Abhushan INDIA Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 380, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kangan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Laxmi Jewellery House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 79, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'M R Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 18, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mukesh Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 133, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Narendra Keshavlal & Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'New Sona Chandi Gold Cash'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'The Dacca Jewellery & Mina House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 32, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Uma Jewellery Works'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 36, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vinayak Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Abhushan Alankar Jewellers & Bartan'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gaytri Alankar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 116, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jevar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 33, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'K.V.R Fashion Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 55, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pearl House'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.70, 67, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ranchi Silvers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 241, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Balajee Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 242, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sita Ram Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Shyam Alankar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 129, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Tiru Bala Ji Jewellers Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 60, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Daulath Krishna Jewellers Silver Palace'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 19, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Makam Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mandoth Jewellers and Bankers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 39, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Milan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 104, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mivaan Fine Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 28, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'New Mathaji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Nk Designers & Jewellerys'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.60, 52, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Padmapriya jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 467, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Ganesh Diamonds & Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Akshata Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Era Italian Silver'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 7, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'G T C And Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Haji Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Iqra Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 34, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'New Arun Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 65, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Prasanna Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 398, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'S L Shet Diamond House'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sharmila Jewellery Bharath Finance'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 29, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Laxmi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 131, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'A Shankara Chetty & Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 495, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chamundeshwari Gold & Silver'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 239, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Cvr Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Cvr Luxury Family Store'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Guru Diamonds And Jewellery Works'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 2033, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Lalitha Jewellery Mart'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 97, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'New Shubhm Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 7, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'R R Jeweller'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 137, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sharada Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Vimaleshwara Jewellery Works'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 65, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ishal Rental Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 57, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Khaira - Rental Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 236, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kollam Supreme'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 36, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Lulu Fashion Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 954, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Nakshatra Gold and Diamonds'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 41, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Palace Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 488, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rajadhani Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Amaya The Jewel Boutique'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 276, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Cammilli Diamond and Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 226, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Diya Gold And Diamonds'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 157, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'IMG GOLD BUYERS'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 245, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jewellery By La Broiche'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 525, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'MINAR FASHION JEWELLERY'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Nirmaliyam Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 55, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sai Pearls & Gems'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shazana Gold and Diamond'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Silver Shop'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 324, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Malavika Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 463, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Manjali Thrissur Fashion Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 857, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Oh By Ozy'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 3237, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'PereppadanS Gold & Diamonds'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Phoenix Gold and Silver'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 41, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sree Ajaya Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 51, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sree Subbiah Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 63, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Subbiah Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 60, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Theertham Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 45, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Thrissur Grace Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Agarwal Diamond'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.50, 211, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Amrapali Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 304, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Amrapali Jewellers Ratan Showroom'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chandrapushp Johari Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 99, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Johri Bandhu Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 667, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Krishnam Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 23, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'New Shri Krishna Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Ganesh Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 61, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swarna Sukh'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 83, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Agarwal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ganpat Lal Keshrimal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 753, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Manish Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 20, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Muskan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 46, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ornam Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 18, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rama Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ratanlal Saraf Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 18, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Siddhivinayak Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 256, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Suvarna Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Wedding Point'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Banarasi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 481, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jewellers Madanlal Chhaganlal'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 1594, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jewellers Nanabhai'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Maanik Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 71, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'New Krishna Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 96, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rajat Gems & Jewelleries'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 92, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ratna House Jewel'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Yashika Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.70, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Abhushan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 916, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chandukaka Saraf Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 222, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Deepak Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Dev Bhairav Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 97, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Dinesh Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 652, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Indriya (R City Mall)'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 33, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'J S J'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 158, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bafna Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 69, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bgr Walokar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 35, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chimurkar Brothers Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 1936, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Karan Kothari Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 3230, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Londe Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 40, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'M. Dhomne Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 616, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Parekh Brothers Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 62, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pramod Jewellers & Gift Centre'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 3189, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rokde Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 134, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'SHREE JEWELLERS & SAREES'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 64, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'A S Ashtekar Saraf'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 38, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Aarya Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 15, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Arvind Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kulswamini Jewellers Jalgaonkar'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ms Narayan Gopalsheth Adgaonkar'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Nrutyaa Diamond Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pournima Jewellers'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.10, 82, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'VADNERE SARAF'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Yashwant Martand Maind'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 401, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gold Mart Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 295, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pawan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 133, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'RMK Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ratnamani Gems and Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 42, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Jagdamba Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 1627, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Radhe Pearls'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 47, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Tapadia Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 222, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'V K MALI JEWELLERS'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 395, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Carat Lane'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 25, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gomti Jewellery Cum Handloom House'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 22, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Hakim Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jash Kangabam'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 18, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Krishna Prasad Gemstone And Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 42, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Manikchand Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rm Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 15, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'S R Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 158, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Manikumar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Aarohana.Official (Crystal)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Lafsana Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 53, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'M P J Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Manik Chand Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 27, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Santoshi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sham Singh Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Soumya Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Star Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swarnadeep Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Trreasure Hut'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'M S Goldsmith'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Manisha Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 57, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mia By Tanishq'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.70, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Nirmala Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Remna Gold & Jewellery (Rgj Goldsmith)'
UNION ALL
SELECT c.id, CURRENT_DATE, 2.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Silver Paradise'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sparks'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'T B C Store Wholesale And Retail'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Zopa Gold Smith'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bonafide'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ishaan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kk Sunari Shop'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Life Style (Sonu)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'MiachicO jewellery Shop'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Paul Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rj & Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Suman Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 23, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'YSR Pearls'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 79, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anil Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 759, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Manisha Art Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = '916 Kashinath Jewellers'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.90, 74, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Agarwal Diamond Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 8824, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chandi Bhandar'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 100, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Hemji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 121, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Hemraj Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 55, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kgn Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 8593, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Khimji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 7, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Collection'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 37, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swarna Alankar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 31, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vinayaklal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 7, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Amar and Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ashish jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 19, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Billa Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 116, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gurdeep Singh & Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kimti Lal & Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 33, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'M Kaur Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 73, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Piara Singh & Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 27, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Raj Kumar & Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Guru Ram Dass Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 33, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Sahib Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bhatia & Company Nagan Wale'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 74, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chaman Lal Subhash Chander Jewellers Legacy Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 113, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Devki Nandan Meharchand Sekhri Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 23, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gems INDIA'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 51, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kanda Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 16, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Palak Traders'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 116, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'RS Gold Byers - Sell Your Gold For Cash'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 54, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Satnam Gems & Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 61, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Ganpati Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 74, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Varun Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Canady Jewellers (Rummi Wale)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gupta Art Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 32, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jain Silver Creations Or Momentz'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 53, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mona Traderss'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Panjaab Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 70, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pink City Handicraft'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Raghbir Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'V P Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 16, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'VIRK Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 17, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'WAZIR JEWELLERS'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Daulatram Churuwala And Sons (DRS)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 1186, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'JKJ & Sons Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 737, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'JKJ Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 210, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jmj Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 37, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Khandelwal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.30, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Orissa Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 212, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Psj Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 190, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Psj Jewellers Jaipur'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Hari Jwellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kawaakari Silver Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 60, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ladli Imitation'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.80, 28, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mahalaxmi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 226, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pure Gold Jodhpur'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Radha Rani Artificial Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.40, 25, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shivaji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Dwareka Dheesh Jewellerys'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Kana Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 86, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vardhaman Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 12, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ambesh Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 147, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Auric Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.60, 76, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'K T School Uniform'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pristine Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 140, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'RR Gems & Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 48, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'RoopShree Art Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rp Gold 1gm'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree R B Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 24, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sunder Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chakravarti Verma Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 8, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pieces Of Me'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 221, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pristine'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 247, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ram Chandra Pradeep Kumar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ramchandra Rajkumar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 1134, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Senco Gold & Diamonds'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.60, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shakya Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 10, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Ganapati Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 82, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Z & C Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1114, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Dev Silver & Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 507, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Goutham Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.20, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gowry Jewellery Mart'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 122, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jayaram Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 474, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jhillmill Fashion Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 549, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Konika Jewellery Pvt Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 52, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mahaveer Gold Palace'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Om Sri Viswakarama Gold Company'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 189, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Omr Bazaar Street'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 318, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swarna Maligai Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Akshaya Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Dhruva Diamonds and Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 70, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jeeva Trenz'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 408, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kumaran Chain Shop'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sree Ranga Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 62, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Mahalakshmi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 41, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Mangalam Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 5, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Muhurtha Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 129, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vidhyass Designer Jewellers Boutique'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 27, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Viyaan Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 248, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Balan Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Gkv Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 9, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'SRI Puspha Nagaimaligai'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Seenu Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Siva Thanga Meenakshi Jewellers'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 3.60, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sreenivasan Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 59, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Balambigai Jewellery Mart'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 2175, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Kamatchi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 24, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Muthu Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 26, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Thanga Meenakshi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 438, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jauhari Jewellers Crafted For You'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Krishna Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Ksb Gold Works'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 697, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Lotus Silver Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 524, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'R R Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 248, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Rajshree Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 376, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'The Diamond Store By Chandubhai'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Aparana Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 88, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kothakonda Silver Palace Jewellers & Gems'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Padmavathi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'SAI Maruthi Jewellers Show Room'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.00, 154, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Siri Pearls & Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 15, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sumangali Sarees And Ladies Emporium'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 864, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Venus Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vuppula Shiva Chidanbaraiah Gold and Sliver Merchants'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 13, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chandrani Pearls'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.90, 266, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kalika Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Moni Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.50, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'New Saha Jewellery & Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 227, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Radha Krishna Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 227, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Radhakrishna Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 603, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sabitri Gold Plating Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sananda Jewelery'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Krishna Gold Plating Jewellery'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 1204, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Swarnakamal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 23, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Dau Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 86, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jewel Empire'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Laxmi Narain Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 25, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'M.K. Creation'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 222, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pc Jeweller Limited'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 1, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sachin Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 6, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shiri Nath Ji Sarraf'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 30, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Suresh Chand Neeraj Kumar Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 208, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'The Rose Gold'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 365, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'V J Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 3, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kamakshi Jewellers & Ratna Kendra'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 58, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kamal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 21384, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kashi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kumar Jewellers & Rashi Ratna Kendra ( Bilhaur Wale)'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.80, 16, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Laxmi Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 28, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Mani Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Narayan Mangal Diamond Business'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 22, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Jouhari Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'The Kaushal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 59, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'VAGMI R. A. JEWELLERS'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

INSERT INTO competitor_metrics_daily (competitor_id, snapshot_date, rating_avg, review_count, market_presence_label, timeframe_window)
SELECT c.id, CURRENT_DATE, 4.80, 28, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Anil Kumar Nitish Kumar Jain Jewellers Pvt. Ltd'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 11, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Archvin''s International'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 100, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Bansal Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 973, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Jewels Box (Gold & Diamond)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 104, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Khun Khun Ji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 24, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kishori Ji Jewels'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.40, 144, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Lucknow Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 771, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Punjab Jewellers and Sons'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.10, 104, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Khun Khun Ji Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 249, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Sri Badri Saraf - Singar Nagar Wale'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 72, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = '1 One Gram Gold Jewellery (Khattri Creation)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 1501, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chetmani Gems & Jewels Private Limited (Ravindrapuri)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 4665, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Chetmani Gems & Jewels Pvt Ltd (Flagship Store)'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.20, 651, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Kanhaiya Lal Saraf Jewellers Trueso'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.70, 14, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Makund Das Narsingh Das Sonawala'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 4, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pavitrani Jewellers'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.90, 512, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Preetam Jewellers Nxt'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.60, 368, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shree Banaras Jewels Pvt. Ltd.'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.30, 86, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Shri Banaras Swarn Kala Kendra'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.70, 99, 'Medium', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Vijay Alankar Mandir'
UNION ALL
SELECT c.id, CURRENT_DATE, 3.50, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'MY BEAUTY SHOPSS'
UNION ALL
SELECT c.id, CURRENT_DATE, 5.00, 2, 'Low', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Pednekar Suvarna Palace'
UNION ALL
SELECT c.id, CURRENT_DATE, 4.80, 227, 'High', 'last_90_days' FROM competitors c WHERE c.competitor_name = 'Tulsi Jewellers'
ON CONFLICT (competitor_id, snapshot_date, timeframe_window) DO UPDATE
SET rating_avg = EXCLUDED.rating_avg, review_count = EXCLUDED.review_count, market_presence_label = EXCLUDED.market_presence_label;

-- Total unique metrics to import: 523
