# KrishiJal - A Smart tool for Irrigation Scheduling and Soil Image Analysis

### Innovation: Bridges FAO-56 science with AI/ML for farmer-friendly irrigation.
### Impact: Sustainable water use, higher yields for small farmers.

---
#### For Testing Purpose
--> User credentials:
```bash
- User name: Test Farmer
- Phone : 1234567890
```
```bash
curl -X POST http://localhost:5000/api/generate-schedule \
  -H "Content-Type: application/json" \
  -d '{"personal_info":{"farmer_name":"Test Farmer","phone":"1234567890"},"soil_type":"Sandy Loam","crop_info":{"name":"Rice","growth_stage":2},"location":{"address":"Phalodi"},"farm_size":{"area":"2"}}'
```

#### for image processing(Soil Image Classification Model)
```bash
curl -X POST "https://krishijal.onrender.com/api/classify-soil" \
  -H "Content-Type: multipart/form-data" \
  -F "soil_image=@app/src/Assets/Soil.jpg" \
  --max-time 180 \
  --show-error
```