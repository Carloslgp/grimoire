CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT now()
);
create table token_backlist (
  id uuid default gen_random_uuid() primary key,
  token text not null,
  invalidated_at timestamp default now()
);
CREATE TABLE registries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    tag TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);