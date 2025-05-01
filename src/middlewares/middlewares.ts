import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Lấy token từ localStorage không hoạt động trong middleware,
  // nhưng có thể lấy từ cookie nếu bạn muốn implement route protection ở đây

  // Cách tốt hơn là kiểm tra trong các component client-side
  // nhưng nếu cần, bạn có thể set cookie khi đăng nhập thành công
  // const token = request.cookies.get('auth-token')?.value;

  // Để sửa lỗi hiện tại, chúng ta nên loại bỏ middleware
  // và để các component client-side xử lý route protection

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cụ thể nếu cần
export const config = {
  matcher: [], // Để trống để tạm thời vô hiệu hóa middleware
};
