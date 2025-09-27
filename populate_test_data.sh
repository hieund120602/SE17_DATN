#!/bin/bash

# ================================================
# SCRIPT TẠO DỮ LIỆU TEST CHO HỆ THỐNG E-LEARNING
# ================================================

echo "🚀 Script tạo dữ liệu test cho hệ thống E-Learning"
echo "=============================================="

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:8080/api"
TEST_DATA_ENDPOINT="$API_BASE_URL/test-data"

# Function để check server
check_server() {
    echo -e "${BLUE}🔍 Checking server status...${NC}"
    
    if curl -s --max-time 5 "$API_BASE_URL/test-data/status" > /dev/null; then
        echo -e "${GREEN}✅ Server is running!${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running or not accessible at $API_BASE_URL${NC}"
        echo -e "${YELLOW}💡 Please start the Spring Boot application first${NC}"
        return 1
    fi
}

# Function để get info về test data
get_info() {
    echo -e "${BLUE}📋 Getting test data information...${NC}"
    
    response=$(curl -s -X GET "$TEST_DATA_ENDPOINT/info")
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}📄 Test Data Information:${NC}"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        echo -e "${RED}❌ Failed to get information${NC}"
    fi
}

# Function để populate dữ liệu
populate_data() {
    echo -e "${BLUE}🛠️ Creating test data...${NC}"
    echo "This will create:"
    echo "  • 4 tutors với credentials khác nhau"
    echo "  • 5 courses: Hiragana, Katakana, Kanji, Ngữ pháp N5, Từ vựng N5"
    echo "  • 17+ modules với nội dung phong phú"
    echo "  • 14+ lessons với video links"
    echo "  • 10+ exercises với 7 loại khác nhau:"
    echo "    - FILL_IN_BLANK (điền từ vào chỗ trống)"
    echo "    - MULTIPLE_CHOICE (trắc nghiệm)"
    echo "    - SPEECH_RECOGNITION (nhận dạng giọng nói)"
    echo "    - LISTENING (bài tập nghe)"
    echo "    - WRITING (bài tập viết)"
    echo "    - MATCHING (nối từ)"
    echo "    - PRONUNCIATION (luyện phát âm)"
    echo "  • 20+ questions với options đa dạng"
    echo "  • 4+ resources (PDF và audio files)"
    echo "  • 2 course combos với discount"
    echo ""
    
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️ Operation cancelled${NC}"
        return 1
    fi
    
    echo -e "${BLUE}⏳ Creating data... This may take a few moments...${NC}"
    
    response=$(curl -s -X POST "$TEST_DATA_ENDPOINT/populate" \
        -H "Content-Type: application/json")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Data creation completed!${NC}"
        echo -e "${GREEN}📊 Response:${NC}"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        echo -e "${RED}❌ Failed to create test data${NC}"
        echo "Response: $response"
    fi
}

# Function để clear dữ liệu
clear_data() {
    echo -e "${YELLOW}🗑️ This will delete ALL test data:${NC}"
    echo "  • All courses and combos"
    echo "  • All modules and lessons"
    echo "  • All exercises and questions"
    echo "  • All tutors and resources"
    echo ""
    
    read -p "Are you sure? This cannot be undone! (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️ Operation cancelled${NC}"
        return 1
    fi
    
    echo -e "${BLUE}⏳ Clearing data...${NC}"
    
    response=$(curl -s -X DELETE "$TEST_DATA_ENDPOINT/clear")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All test data cleared!${NC}"
        echo -e "${GREEN}📊 Response:${NC}"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        echo -e "${RED}❌ Failed to clear test data${NC}"
        echo "Response: $response"
    fi
}

# Function để test các exercises
test_exercises() {
    echo -e "${BLUE}🧪 Testing exercise endpoints...${NC}"
    
    # Get courses
    echo "Getting courses..."
    courses_response=$(curl -s "$API_BASE_URL/courses")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Courses endpoint working${NC}"
        
        # Extract first course ID (assuming JSON response)
        course_id=$(echo "$courses_response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list) and len(data) > 0:
    print(data[0]['id'])
elif isinstance(data, dict) and 'content' in data and len(data['content']) > 0:
    print(data['content'][0]['id'])
" 2>/dev/null)
        
        if [ ! -z "$course_id" ]; then
            echo "Testing course detail for ID: $course_id"
            course_detail=$(curl -s "$API_BASE_URL/courses/$course_id")
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Course detail endpoint working${NC}"
                echo "✅ Ready to test exercises in frontend!"
            else
                echo -e "${RED}❌ Course detail endpoint failed${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️ No course ID found${NC}"
        fi
    else
        echo -e "${RED}❌ Courses endpoint failed${NC}"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}📋 Test Data Management Menu${NC}"
    echo "=============================="
    echo "1. 📋 Get information about test data"
    echo "2. 🛠️ Create test data (populate)"
    echo "3. 🗑️ Clear all test data"
    echo "4. 🧪 Test exercise endpoints"
    echo "5. 🔍 Check server status"
    echo "6. ❌ Exit"
    echo ""
}

# Main script
main() {
    echo -e "${GREEN}🎌 Japanese Learning Platform - Test Data Script${NC}"
    echo "================================================="
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    while true; do
        show_menu
        read -p "Enter your choice (1-6): " choice
        
        case $choice in
            1)
                get_info
                ;;
            2)
                populate_data
                ;;
            3)
                clear_data
                ;;
            4)
                test_exercises
                ;;
            5)
                check_server
                ;;
            6)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please try again.${NC}"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Quick options cho command line
case "$1" in
    "info")
        check_server && get_info
        ;;
    "populate")
        check_server && populate_data
        ;;
    "clear")
        check_server && clear_data
        ;;
    "test")
        check_server && test_exercises
        ;;
    *)
        main
        ;;
esac 