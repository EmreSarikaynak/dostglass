-- migrate:up
-- Orijinal cam talepleri için bildirim odaklı alanlar

alter table original_glass_requests
  add column if not exists delivery_reminder_sent_at timestamptz;

create index if not exists idx_ogr_delivery_reminder on original_glass_requests(delivery_reminder_sent_at);

comment on column original_glass_requests.delivery_reminder_sent_at is
  'Teslim hatırlatma bildiriminin en son gönderildiği zaman';

-- migrate:down

drop index if exists idx_ogr_delivery_reminder;

alter table original_glass_requests
  drop column if exists delivery_reminder_sent_at;
