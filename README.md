## Villa Laundry Tracker

### Database Setup

1. Go to your [Supabase project](https://app.supabase.com)
2. Navigate to SQL Editor
3. Create a new query and paste the following SQL:

```sql
-- Function to initialize schema
create or replace function public.initialize_schema()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create the main table
  create table if not exists public.laundry_orders (
    id bigserial primary key,
    order_number bigint not null unique,
    villa_name text not null,
    guest_name text not null,
    order_date timestamp with time zone not null default now(),
    delivery_date timestamp with time zone,
    delivered boolean not null default false,
    total_garments integer not null,
    shirts integer not null default 0,
    tshirts integer not null default 0,
    jeans integer not null default 0,
    trousers integer not null default 0,
    shorts integer not null default 0,
    inner_wear integer not null default 0,
    socks integer not null default 0,
    womens_dresses integer not null default 0,
    coat_jacket integer not null default 0,
    cap_hat integer not null default 0,
    other integer not null default 0,
    notes text,
    created_at timestamp with time zone not null default now()
  );

  -- Create index for faster sorting
  create index if not exists idx_laundry_orders_delivered_date 
    on public.laundry_orders(delivered, order_date desc);

  -- Enable RLS
  alter table public.laundry_orders enable row level security;

  -- Drop existing policy if it exists
  drop policy if exists "Enable all operations for authenticated users" on public.laundry_orders;

  -- Create policy
  create policy "Enable all operations for authenticated users"
    on public.laundry_orders
    for all
    using (true)
    with check (true);
end;
$$;