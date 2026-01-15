# SGT POMan Chrome Extension

Tiện ích giúp tạo nội dung cần sao chép nhanh cho bộ phận POMan dựa trên các trường nhập liệu trong popup.

## Tính năng

- Chọn Trường hợp (Case 1-4)
- Đối tác giao hàng (chỉ bắt buộc khi chọn Case 1 hoặc Case 2)
- Trạng thái kích hoạt (danh sách gợi ý)
- VAT (Có/Không)
- Tiền cước (nếu có) và ghi chú thêm
- Sao chép nhanh vào clipboard
- Tải mới dữ liệu đối tác từ Google Sheet và cache vào storage

## Trường bắt buộc

- Trường hợp
- Kích hoạt
- VAT
- Đối tác giao hàng: bắt buộc khi Trường hợp là Case 1 hoặc Case 2

## Định dạng nội dung sao chép

Nội dung được ghép theo thứ tự:

```
[Trường hợp] | [Tên đối tác [mã đối tác]] | [Kích hoạt] | [VAT] | Cước: [số tiền] | [Ghi chú]
```

Ghi chú:
- Nếu không có tiền cước hoặc ghi chú thì bỏ qua phần tương ứng.
- Đối tác sẽ tự động chuẩn hóa theo data: `Tên đối tác [mã đối tác]`.

## Dữ liệu đối tác giao hàng

Nguồn dữ liệu: Google Sheet (read-only).

- Nút "Mở Google Sheet" để mở nhanh link nhập liệu.
- Nút "Tải dữ liệu mới" sẽ fetch CSV từ Google Sheet và cache vào `chrome.storage`.
- File gốc trong repo: `doitacgiaohang.csv` (được tạo từ Sheet).

### Cập nhật file CSV trong repo

Chạy script sau để cập nhật file CSV trong repo:

```
powershell -ExecutionPolicy Bypass -File scripts\fetch-doitacgiaohang.ps1
```

## Cài đặt

1. Mở `chrome://extensions/`.
2. Bật Developer mode.
3. Chọn Load unpacked và trỏ tới thư mục dự án.

## Yêu cầu

- Google Chrome
- Quyền clipboard
- Quyền storage (để cache dữ liệu đối tác)
