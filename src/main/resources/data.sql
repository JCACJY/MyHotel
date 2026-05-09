MERGE INTO room (code, name, description, price, bed, size, image_key)
KEY (code)
VALUES
('deluxe', '豪华大床房', '城市景观、定制大床、意式咖啡机，享受静谧舒适的入住体验。', 888.00, '1.8m 大床', '42㎡', 'room-deluxe'),
('twin', '高级双床房', '宽敞双床布局，适合商旅同行或家庭出行的舒适之选。', 728.00, '1.2m 双床', '38㎡', 'room-twin'),
('suite', '行政套房', '独立客厅与会客区，享行政酒廊礼遇与专属管家服务。', 1688.00, '1.8m 大床 + 客厅', '78㎡', 'room-suite');
