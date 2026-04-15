CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT now()
);
create table token_blacklist (
  id uuid default gen_random_uuid() primary key,
  token text not null,
  invalidated_at timestamp default now()
);