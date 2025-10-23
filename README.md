# Chrome Extension - SGT SALES

Extension Chrome giúp tạo và sao chép ghi chú đơn đặt hàng khi lên đơn hàng trên Kiot Việt.


## Tính năng

- Hỗ trợ loại khách hàng: KWM, KWC, KLM, KLC
- Hỗ trợ nguồn khách: SGT, DTGR, DTMB, WSS
- Hỗ trợ kênh tương tác: Call, OA, DW, FB
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
KWM - DTGR - Call | Giao lắp | Không VAT | Cước xe: 100.000đ | Ghi chú tùy chọn
```

Quy tắc ghép:

- `Field 1` luôn đứng đầu (KWM/KWC/KLM/KLC).  
- Nếu chọn **KWM**, tự động ghép `Nguồn Khách` và `Kênh Tương Tác`.  
- Nếu chọn **Hình thức giao** sẽ chèn sau dấu `|`.  
- Nếu chọn **VAT** sẽ nối tiếp ngay sau đó.  
- Nếu nhập **Cước xe**, định dạng tự động thành `Cước xe: xxx.xxxđ`.  
- Nếu nhập **Ghi chú**, nối cuối chuỗi bằng `| [ghi chú]`.


## Yêu cầu

- Chrome Browser
- Quyền truy cập clipboard
- Quyền activeTab
