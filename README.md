# Chrome Extension - SGT SALES

Extension Chrome giúp tạo và sao chép ghi chú đơn đặt hàng khi lên đơn hàng trên Kiot Việt.


## Tính năng

- Hỗ trợ loại khách hàng: KWM, KWC, KLM, KLC
- Hỗ trợ nguồn khách: SGT, DTGR, DTMB, WSS
- Hỗ trợ kênh tương tác: Call, OA, DW, FB
- Hỗ trợ bán hàng bao kích (BK)
- Hỗ trợ ghi chú VAT
- Hỗ trợ ghi chú thêm
- Hỗ trợ thêm phí cước xe
- Sao chép nhanh vào clipboard


## Cài đặt

### Chrome giao diện tiếng Anh

1. Tải bản mới nhất từ Releases, giải nén thành thư mục
2. Mở Chrome và truy cập `chrome://extensions/`
3. Bật công tắc **Developer mode** (góc trên cùng bên phải)
4. Nhấn nút **Load unpacked** và chọn thư mục chứa extension

### Chrome giao diện tiếng Việt

1. Tải bản mới nhất từ Releases, giải nén thành thư mục
2. Mở Chrome và truy cập `chrome://extensions/`
3. Bật công tắc **Chế độ dành cho nhà phát triển** (góc trên cùng bên phải)
4. Nhấn nút **Tải tiện ích đã giải nén** và chọn thư mục chứa extension


## Format kết quả 

Ví dụ khi điền đầy đủ:

```
KWM - DTGR - OA | GKL | VAT | BK | Cước xe: 100.000đ | Ghi chú tùy chọn
```

Quy tắc ghép:

| Văn bản hiển thị (UI)                | Văn bản copy vào clipboard                       |
|--------------------------------------|--------------------------------------------------|
| Loaị, nguồn, kênh khách hàng         | `[Loại khách] - [Nguồn khách] - [Kênh tương tác]`|
| Hình thức giao = Giao lắp            | `Giao lắp`                                       |
| Hình thức giao = GKL (Giao không lắp)| `GKL`                                            |
| Hình thức giao = BTK (Bốc tại kho)   | `BTK`                                            |
| VAT = Có lấy VAT                     | `VAT`                                            |
| VAT = Không lấy VAT                  | `Không VAT`                                      |
| Bán hàng bao kích                    | `BK`                                             |
| Cước xe (ví dụ nhập `100000`)        | `Cước xe: 100.000đ`                              |
| Ghi chú                              | `| [nội dung ghi chú]` (nối cuối chuỗi)          |
| Không nhập các field tùy chọn        | Những phần tương ứng sẽ bị loại bỏ               |


## Yêu cầu

- Chrome Browser
- Quyền truy cập clipboard
- Quyền activeTab
