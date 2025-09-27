#!/bin/bash

# Quick Test Data Population Script
echo "🚀 Quick populate test data for Japanese E-Learning Platform"

API_URL="http://localhost:8080/api"

# Check if server is running
echo "🔍 Checking server..."
if ! curl -s --max-time 3 "$API_URL/test-data/status" > /dev/null 2>&1; then
    echo "❌ Server is not running! Please start Spring Boot app first:"
    echo "   cd japanese-learning-platform && mvn spring-boot:run"
    exit 1
fi

echo "✅ Server is running!"

# Populate data
echo "🛠️ Creating test data..."
response=$(curl -s -X POST "$API_URL/test-data/populate" -H "Content-Type: application/json")

if echo "$response" | grep -q '"success":true' 2>/dev/null; then
    echo "✅ Test data created successfully!"
    echo ""
    echo "📊 Created:"
    echo "  • 4 tutors (password: password123)"
    echo "  • 5 courses (Hiragana, Katakana, Kanji, N5 Grammar, N5 Vocab)"
    echo "  • 17+ modules with lessons"
    echo "  • 10+ exercises with 7 different types:"
    echo "    - FILL_IN_BLANK ✅ (working perfectly)"
    echo "    - MULTIPLE_CHOICE ✅ (working perfectly)"
    echo "    - SPEECH_RECOGNITION 🎤 (has audio)"
    echo "    - LISTENING 🔊 (has audio)"
    echo "    - WRITING ✍️ (structure ready)"
    echo "    - MATCHING 🔗 (structure ready)"
    echo "    - PRONUNCIATION 🗣️ (has audio)"
    echo "  • 20+ questions with options"
    echo "  • Course combos with discounts"
    echo ""
    echo "🎯 Ready to test!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8080"
    echo ""
    echo "💡 Test scenarios:"
    echo "   1. Go to a course → lesson → exercises tab"
    echo "   2. Try FILL_IN_BLANK exercises (điền từ vào chỗ trống)"
    echo "   3. Try MULTIPLE_CHOICE exercises (trắc nghiệm)"
    echo "   4. Test other exercise types"
else
    echo "❌ Failed to create test data"
    echo "Response: $response"
    exit 1
fi

# Optional: Show courses
echo ""
echo "📚 Available courses:"
curl -s "$API_URL/courses" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    courses = data.get('content', data) if isinstance(data, dict) else data
    if isinstance(courses, list):
        for i, course in enumerate(courses[:5], 1):
            print(f'  {i}. {course.get(\"title\", \"Unknown\")} - {course.get(\"level\", \"N/A\")} - {\"FREE\" if course.get(\"isFree\") else str(course.get(\"price\", 0)) + \" VND\"}')
    else:
        print('  Could not parse courses')
except:
    print('  Could not fetch courses')
" 2>/dev/null || echo "  (Could not display courses list)"

echo ""
echo "🎉 All set! Happy testing!" 