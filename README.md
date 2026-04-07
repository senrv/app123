# Sistem Laporan Bullying SMK Prima Unggul

Aplikasi pelaporan tindakan bullying berbasis website untuk SMK Prima Unggul.

## Teknologi
- React (Vite)
- Tailwind CSS
- Supabase (Auth & Database)
- Motion (Animations)
- Lucide React (Icons)

## Setup Database (Supabase)

Jalankan query SQL berikut di SQL Editor Supabase Anda untuk membuat tabel dan kebijakan keamanan (RLS):

```sql
-- 1. Tabel Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text check (role in ('admin', 'guru', 'siswa')) not null,
  nis text,
  kelas text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel Reports
create table reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references profiles(id) on delete cascade not null,
  victim_name text not null,
  incident_date date not null,
  location text not null,
  description text not null,
  status text check (status in ('diproses', 'selesai', 'ditolak')) default 'diproses' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel Follow-ups
create table follow_ups (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references reports(id) on delete cascade not null,
  handler_id uuid references profiles(id) on delete cascade not null,
  response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Aktifkan RLS
alter table profiles enable row level security;
alter table reports enable row level security;
alter table follow_ups enable row level security;

-- 5. Kebijakan Keamanan (Policies)

-- Profiles
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can read all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert profiles" on profiles for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Reports
create policy "Siswa can read own reports" on reports for select using (reporter_id = auth.uid());
create policy "Siswa can create reports" on reports for insert with check (auth.uid() = reporter_id);
create policy "Guru/Admin can read all reports" on reports for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'guru'))
);
create policy "Guru/Admin can update report status" on reports for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'guru'))
);

-- Follow-ups
create policy "Anyone authenticated can read follow-ups" on follow_ups for select using (auth.uid() is not null);
create policy "Anyone authenticated can create follow-ups" on follow_ups for insert with check (auth.uid() is not null);

-- 6. Trigger untuk Profil Otomatis (First user becomes Admin)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_count int;
begin
  select count(*) into user_count from public.profiles;
  
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'User Baru'), 
    case when user_count = 0 then 'admin' else 'siswa' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Konfigurasi Environment
Pastikan Anda mengisi variabel berikut di panel Secrets AI Studio:
- `VITE_SUPABASE_URL`: URL project Supabase Anda.
- `VITE_SUPABASE_ANON_KEY`: Anon key project Supabase Anda.
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Service role key (diperlukan untuk fitur Admin User Management).
