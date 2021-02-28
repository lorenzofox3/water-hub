# water-hub
app to visualize France water streams temperature

## set up database instructions
1. ``\i ./packages/scripts/schema.sql``
2. ``\copy raw.stations FROM './db/data/stations.csv' DELIMITER ';' CSV HEADER;``
3. ``\copy raw.temperature_samples FROM './db/data/analyse.csv' DELIMITER ';' CSV HEADER;``
4. ``cd ./packages/scripts &&  node -r dotenv/config load-boundaries.js``
5. ``\i ./packages/scripts/raw-to-normalized.sql``
