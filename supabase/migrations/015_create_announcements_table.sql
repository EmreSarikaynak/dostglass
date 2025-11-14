-- Duyurular Tablosu
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 0, -- Yüksek öncelikli duyurular carousel'da önce gösterilir
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_valid_from ON announcements(valid_from);
CREATE INDEX idx_announcements_valid_until ON announcements(valid_until);
CREATE INDEX idx_announcements_priority ON announcements(priority DESC);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- RLS Policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Admin: Tüm duyuruları görebilir
CREATE POLICY announcements_admin_select ON announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Bayi: Sadece aktif ve geçerli duyuruları görebilir
CREATE POLICY announcements_bayi_select ON announcements
  FOR SELECT
  USING (
    is_active = true
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND role = 'bayi'
    )
  );

-- Admin: Insert, Update, Delete
-- NOT: Bunlar için SERVICE_ROLE kullanacağız, bu yüzden RLS policy'leri gerekmez
-- Ama yine de güvenlik için ekleyelim

CREATE POLICY announcements_admin_insert ON announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY announcements_admin_update ON announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY announcements_admin_delete ON announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Örnek veri
INSERT INTO announcements (title, content, is_active, valid_from, valid_until, priority)
VALUES 
  (
    'Hoş Geldiniz! 🎉',
    '<h2>DostGlass Cam Sigorta Yönetim Sistemi</h2><p>Sistemimize hoş geldiniz! Bu platform üzerinden tüm cam sigorta işlemlerinizi kolayca yönetebilirsiniz.</p><p><strong>Özellikler:</strong></p><ul><li>Online başvuru takibi</li><li>Hızlı onay süreci</li><li>Anlık bildirimler</li><li>Detaylı raporlama</li></ul>',
    true,
    NOW(),
    NOW() + INTERVAL '30 days',
    10
  ),
  (
    'Yeni Araç Markaları Eklendi',
    '<p>Sistemimize <strong>98 marka</strong> ve <strong>1348 model</strong> araç eklendi!</p><p>Artık daha geniş bir yelpazede araç sigortası işlemlerinizi gerçekleştirebilirsiniz.</p><p>Kategori detayları:</p><ul><li>Binek: 25 marka, 229 model</li><li>Kamyon: 3 marka, 81 model</li><li>Kamyonet: 10 marka, 61 model</li><li>Motosiklet: 19 marka, 268 model</li><li>İş Makinesi: 17 marka, 258 model</li><li>Ve daha fazlası...</li></ul>',
    true,
    NOW(),
    NOW() + INTERVAL '60 days',
    5
  ),
  (
    'Sistem Bakımı - 25 Aralık',
    '<p><strong>⚠️ Önemli Duyuru</strong></p><p>Sistemimiz <strong>25 Aralık 2024</strong> tarihinde saat <strong>02:00 - 04:00</strong> arası bakım çalışması nedeniyle hizmet dışı kalacaktır.</p><p>Bu süre zarfında sistemimize erişim sağlayamayacaksınız. Anlayışınız için teşekkür ederiz.</p>',
    false,
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '5 days',
    1
  );

COMMENT ON TABLE announcements IS 'Sistem duyuruları - admin tarafından oluşturulur, tüm kullanıcılar görebilir';
COMMENT ON COLUMN announcements.priority IS 'Yüksek değer = Daha üstte gösterilir (carousel sıralaması)';
COMMENT ON COLUMN announcements.valid_until IS 'NULL = süresiz geçerli';

