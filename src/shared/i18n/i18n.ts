import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-locize-backend'; // Import Locize

// Lấy thông tin từ dashboard Locize
const locizeOptions = {
  projectId: import.meta.env.VITE_LOCIZE_PROJECT_ID,
  apiKey: import.meta.env.DEV ? import.meta.env.VITE_LOCIZE_API_KEY : undefined,
  referenceLng: 'vi-VN', // Bắt buộc trùng với Locize
  version: 'latest'
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'vi-VN', // Nếu lỗi thì dùng tiếng Việt
    
    // ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT BẠN CẦN THÊM VÀO:
    supportedLngs: ['vi-VN', 'en-US', 'ja-JP', 'ko-KR', 'zh-Hans-CN'], // Liệt kê đúng các mã trên Locize
    nonExplicitSupportedLngs: false, // Ngăn i18n tự động cắt mã "vi-VN" thành "vi" để tìm kiếm
    load: 'currentOnly', // Bắt buộc i18n chỉ tìm đúng cái mã "vi-VN", không tìm "vi" nữa
    saveMissing: true,
    backend: locizeOptions,
  });

export default i18n;