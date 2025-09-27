// File: app/api/ai-suggestions/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt là bắt buộc' },
        { status: 400 }
      );
    }

    // Sử dụng Google Gemini API - miễn phí không giới hạn
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

      if (!GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Gemini API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env.local' },
          { status: 500 }
        );
      }

      const enhancedPrompt = getEnhancedPrompt(prompt);

      // Sử dụng endpoint mới nhất của Gemini API, thêm hướng dẫn trả về Markdown
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: enhancedPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.95,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        }),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API Error:", errorText);

        // Thử endpoint thay thế nếu endpoint đầu tiên không hoạt động
        return await useAlternativeEndpoint(enhancedPrompt);
      }

      const geminiData = await geminiResponse.json();

      // Kiểm tra lỗi hoặc chặn nội dung
      if (geminiData.promptFeedback?.blockReason) {
        return NextResponse.json(
          { error: `Yêu cầu bị từ chối: ${geminiData.promptFeedback.blockReason}` },
          { status: 400 }
        );
      }

      // Trích xuất nội dung từ phản hồi
      const suggestion = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!suggestion || suggestion.trim() === '') {
        return NextResponse.json(
          { error: 'Không thể tạo nội dung. Vui lòng thử lại với yêu cầu khác.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ suggestion });
    } catch (geminiError) {
      console.error('Lỗi khi gọi Gemini API:', geminiError);

      // Thử endpoint thay thế nếu có lỗi
      return await useAlternativeEndpoint(getEnhancedPrompt(prompt));
    }
  } catch (error) {
    console.error('Error in suggestion API:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

// Thử endpoint thay thế
async function useAlternativeEndpoint(enhancedPrompt: string) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

    // Sử dụng mô hình gemini-pro thay vì gemini-1.0-pro
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.95,
          topK: 40
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Alternative Gemini API Error:", errorText);
      throw new Error(`Alternative Gemini API Error: ${errorText}`);
    }

    const geminiData = await geminiResponse.json();

    // Cấu trúc phản hồi khác nhau cho các phiên bản API khác nhau
    let suggestion = '';

    if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
      suggestion = geminiData.candidates[0].content.parts[0].text || '';
    } else if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].text) {
      suggestion = geminiData.candidates[0].text || '';
    } else if (geminiData.text) {
      suggestion = geminiData.text;
    }

    if (!suggestion || suggestion.trim() === '') {
      throw new Error('Không thể tạo nội dung từ API thay thế.');
    }

    return NextResponse.json({ suggestion });
  } catch (alternativeError) {
    console.error('Lỗi khi gọi API thay thế:', alternativeError);

    // Trả về lỗi cuối cùng
    return NextResponse.json(
      { error: 'Không thể kết nối đến dịch vụ Gemini. Vui lòng kiểm tra API key và thử lại sau.' },
      { status: 503 }
    );
  }
}

// Hàm tối ưu hóa prompt để có kết quả tốt hơn từ Gemini
function getEnhancedPrompt(originalPrompt: string): string {
  // Phân tích loại nội dung dựa trên prompt
  let contentType = 'nội dung khóa học';
  if (originalPrompt.toLowerCase().includes('tổng quan')) {
    contentType = 'tổng quan khóa học';
  } else if (originalPrompt.toLowerCase().includes('nội dung chi tiết')) {
    contentType = 'nội dung chi tiết khóa học';
  } else if (originalPrompt.toLowerCase().includes('bao gồm')) {
    contentType = 'danh sách các tài nguyên và tiện ích được bao gồm trong khóa học';
  }

  return `Bạn là một chuyên gia giáo dục có kinh nghiệm viết nội dung cho các khóa học trực tuyến. Hãy tạo ${contentType} bằng tiếng Việt với định dạng Markdown rõ ràng.

Yêu cầu cụ thể:
${originalPrompt}

Hướng dẫn:
1. Viết bằng tiếng Việt chuẩn, chuyên nghiệp.
2. Sử dụng định dạng Markdown rõ ràng với tiêu đề, danh sách, và phân đoạn hợp lý.
3. Nội dung phải cụ thể, thực tế và có tính ứng dụng cao.
4. Tạo cấu trúc rõ ràng, dễ theo dõi.
5. Đối với danh sách, sử dụng ký hiệu "-" hoặc "* " và nhấn mạnh các điểm quan trọng bằng **bold**.
6. Đối với nội dung chi tiết, chia thành các phần với tiêu đề ## rõ ràng.
7. Đối với tổng quan, tạo một đoạn giới thiệu và liệt kê các điểm chính.

Vui lòng chỉ trả về nội dung đã được định dạng, không bao gồm giải thích, lời giới thiệu hoặc kết luận.`;
}