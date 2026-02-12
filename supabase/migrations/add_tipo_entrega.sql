-- Agregar tipo_entrega a pedidos (recoger vs domicilio)

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_entrega TEXT DEFAULT 'recoger' CHECK (tipo_entrega IN ('recoger', 'domicilio'));

-- Verificar
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'pedidos' AND column_name IN ('tipo_entrega', 'direccion_entrega')
ORDER BY column_name;

-- Ver un resumen
SELECT 'Columnas agregadas exitosamente a pedidos' as mensaje;
