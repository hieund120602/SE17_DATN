#!/bin/bash

# ================================================
# SCRIPT CHẠY TẠO DỮ LIỆU TEST ĐỢN GIẢN
# ================================================

echo "🚀 Tạo dữ liệu test cho hệ thống E-Learning"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Spring Boot is running
echo -e "${BLUE}🔍 Kiểm tra server Spring Boot...${NC}"
if curl -s --max-time 3 "http://localhost:8080/api/courses" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server đang chạy!${NC}"
else
    echo -e "${RED}❌ Server không chạy!${NC}"
    echo -e "${YELLOW}💡 Vui lòng start Spring Boot trước:${NC}"
    echo "   cd japanese-learning-platform && mvn spring-boot:run"
    exit 1
fi

# Get database connection info from application.properties
DB_URL=$(grep "spring.datasource.url" src/main/resources/application.properties | cut -d'=' -f2 | sed 's/jdbc:postgresql:\/\///')
DB_HOST=$(echo $DB_URL | cut -d'/' -f1 | cut -d':' -f1)
DB_PORT=$(echo $DB_URL | cut -d'/' -f1 | cut -d':' -f2)
DB_NAME=$(echo $DB_URL | cut -d'/' -f2 | cut -d'?' -f1)
DB_USER=$(grep "spring.datasource.username" src/main/resources/application.properties | cut -d'=' -f2)
DB_PASS=$(grep "spring.datasource.password" src/main/resources/application.properties | cut -d'=' -f2)

echo -e "${BLUE}📋 Thông tin database:${NC}"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"  
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Check if SQL file exists
if [ ! -f "create_simple_test_data.sql" ]; then
    echo -e "${RED}❌ Không tìm thấy file create_simple_test_data.sql${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🛠️ Tạo dữ liệu test...${NC}"
echo "Sẽ tạo:"
echo "  • 6 users (4 tutors, 1 admin, 1 student)"
echo "  • 5 courses: Hiragana, Katakana, Kanji, Ngữ pháp N5, Từ vựng N5"
echo "  • Modules, lessons, exercises với FILL_IN_BLANK và MULTIPLE_CHOICE"
echo "  • Questions và options cho bài tập"
echo ""

read -p "Tiếp tục? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️ Đã hủy${NC}"
    exit 1
fi

# Run SQL script
echo -e "${BLUE}⏳ Đang chạy SQL script...${NC}"

# Try using psql command directly
export PGPASSWORD=$DB_PASS
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f create_simple_test_data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Tạo dữ liệu thành công!${NC}"
    echo ""
    echo -e "${GREEN}📊 Dữ liệu đã tạo:${NC}"
    echo "  • 4 tutors với password: password123"
    echo "    - akiko@example.com"
    echo "    - hiroshi@example.com" 
    echo "    - yuki@example.com"
    echo "    - kenji@example.com"
    echo "  • 1 admin: admin@example.com (password: password123)"
    echo "  • 1 student: student@example.com (password: password123)"
    echo "  • 5 courses với modules và lessons"
    echo "  • Exercises: FILL_IN_BLANK và MULTIPLE_CHOICE"
    echo ""
    echo -e "${BLUE}🎯 Sẵn sàng test!${NC}"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8080"
    echo ""
    echo -e "${YELLOW}💡 Hướng dẫn test:${NC}"
    echo "   1. Vào một course → lesson → tab exercises"
    echo "   2. Thử FILL_IN_BLANK exercises (điền từ vào chỗ trống)"
    echo "   3. Thử MULTIPLE_CHOICE exercises (trắc nghiệm)"
else
    echo -e "${RED}❌ Lỗi khi tạo dữ liệu${NC}"
    echo -e "${YELLOW}💡 Có thể thử cách khác:${NC}"
    echo "   1. Dùng pgAdmin hoặc tool GUI khác"
    echo "   2. Copy nội dung file create_simple_test_data.sql và chạy trực tiếp"
    exit 1
fi 