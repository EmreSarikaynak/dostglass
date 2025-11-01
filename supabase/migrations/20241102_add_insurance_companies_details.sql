-- Sigorta şirketlerine logo ve döküman alanları ekle
ALTER TABLE insurance_companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS work_procedure TEXT,
ADD COLUMN IF NOT EXISTS required_documents TEXT;

-- Varsayılan logo URL'i için yorum
COMMENT ON COLUMN insurance_companies.logo_url IS 'Sigorta şirketi logosu URL';
COMMENT ON COLUMN insurance_companies.work_procedure IS 'Çalışma prosedürü ve şartları (Markdown destekli)';
COMMENT ON COLUMN insurance_companies.required_documents IS 'Matbuu evraklar listesi (Markdown destekli)';

