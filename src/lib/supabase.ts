import { createClient } from '@supabase/supabase-js';

// Estas variáveis devem ser configuradas no seu ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Atenção: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não foram configurados. A conexão com o banco de dados não funcionará.");
}

// Só inicializa se as chaves existirem para evitar o erro de 'required'
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;