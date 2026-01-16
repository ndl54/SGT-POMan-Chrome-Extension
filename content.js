// Ẩn dropdown gợi ý ở cửa sổ web (ví dụ class là .ant-select-dropdown)
const style = document.createElement('style');
style.innerHTML = `
  .ant-select-dropdown, .ant-select-dropdown-placement-bottomLeft, .ant-select-item-option-content {
    display: none !important;
  }
`;
document.head.appendChild(style);