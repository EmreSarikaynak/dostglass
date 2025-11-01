-- Cam kalemlerine ek malzeme bilgileri ekleme
-- customer_contribution alanının anlamı değişiyor: "Ek Malzeme Kullanıldı mı?"

-- Yeni alanlar ekle
alter table claim_items 
  add column if not exists additional_material_cost numeric(10,2) default 0,
  add column if not exists additional_material_reason text;

-- Yorum güncelle
comment on column claim_items.customer_contribution is 'Ek malzeme kullanıldı mı?';
comment on column claim_items.additional_material_cost is 'Ek malzeme ücreti (TL)';
comment on column claim_items.additional_material_reason is 'Ek malzeme kullanım nedeni';

