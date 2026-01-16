# SGT POMan Chrome Extension

Tiện ích giúp tạo nội dung cần sao chép nhanh cho bộ phận tạo Phiếu Nhập Hàng Nhà Cung Cấp (POMan) dựa trên các trường nhập liệu trong popup.

## Tính năng

- Chọn Trường hợp ai lấy hàng và giao về đâu.
- Đối tác giao hàng (chỉ bắt buộc khi chọn Giao vận/đối tác lấy NCC)
- Trạng thái kích hoạt (danh sách gợi ý)
- VAT (Có/Không)
- Tiền cước (nếu có) và ghi chú thêm
- Sao chép nhanh vào clipboard
- Tải mới dữ liệu đối tác từ Google Sheet và cache vào bộ nhớ máy tính

## Trường bắt buộc

- Trường hợp
- Kích hoạt
- VAT
- Đối tác giao hàng: bắt buộc khi Trường hợp là Giao vận/đối tác lấy NCC

## Định dạng nội dung sao chép

Ví dụ khi điền đầy đủ (Giao vận/đối tác lấy NCC):

```
Đối tác A [DT000001] | Lấy NCC giao khách | Còn Kích | Có VAT | Cước: 100.000đ | Ghi chú tùy chọn
```

Nội dung được ghép theo thứ tự:

```
[Đối tác giao hàng] | [Trường hợp] | [Kích hoạt] | [VAT] | Cước: [số tiền] | [Ghi chú]
```

Áp dụng thứ tự này khi chọn Case 1 hoặc Case 2. Với Case 3 hoặc Case 4, thứ tự sẽ là:

```
[Trường hợp] | [Đối tác giao hàng] | [Kích hoạt] | [VAT] | Cước: [số tiền] | [Ghi chú]
```

Quy tắc ghép:

| Văn bản hiển thị (UI)                                   | Văn bản copy vào clipboard                           |
|---------------------------------------------------------|------------------------------------------------------|
| NCC giao về kho SGT                                     | `Lấy NCC giao khách`                                 |
| NCC giao tới nhà khách hàng                             | `Lấy NCC về kho`                                     |
| Giao vận/đối tác lấy NCC giao khách                     | `NCC giao về kho`                                    |
| Giao vận/đối tác lấy NCC giao về kho SGT                | `NCC giao khách`                                     |
| Đối tác giao hàng                                       | `Tên đối tác [mã đối tác]`                           |
| Kích hoạt                                               | `[Giá trị đã chọn]`                                  |
| VAT = Có VAT                                            | `Có VAT`                                             |
| VAT = Không VAT                                         | `Không VAT`                                          |
| Cước (ví dụ nhập `100000`)                              | `Cước: 100.000đ`                                     |
| Ghi chú                                                 | `| [nội dung ghi chú]` (nối cuối chuỗi)              |
| Không nhập các field tùy chọn                           | Những phần tương ứng sẽ bị loại bỏ                   |

Ghi chú:
- Nếu không có tiền cước hoặc ghi chú thì bỏ qua phần tương ứng.
- Đối tác sẽ tự động chuẩn hóa theo data: `Tên đối tác [mã đối tác]`.

## Nhãn Trường hợp khi sao chép

- Case 1: Lấy NCC giao khách
- Case 2: Lấy NCC về kho
- Case 3: NCC giao về kho
- Case 4: NCC giao khách

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

## Nha cung cap

- Truong tuy chon, goi y tu `nhacungcap.csv` hoac sheet `Nha_Cung_Cap`.
- Khi copy, nha cung cap nam sau doi tac giao hang.
- Nut tai du lieu se cap nhat ca doi tac giao hang va nha cung cap.
