import { pool } from "./pool";

const databaseSchemaSql = `
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  CREATE OR REPLACE FUNCTION public.set_row_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$;

  CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    is_registered BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE app_users
    ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'H2GO User',
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'viewer',
    ADD COLUMN IF NOT EXISTS is_registered BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

  ALTER TABLE app_users
    ALTER COLUMN id SET DEFAULT gen_random_uuid()::text,
    ALTER COLUMN role SET DEFAULT 'viewer',
    ALTER COLUMN is_registered SET DEFAULT false,
    ALTER COLUMN is_active SET DEFAULT true,
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now();

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'app_users_role_check'
    ) THEN
      ALTER TABLE app_users
        ADD CONSTRAINT app_users_role_check
        CHECK (role IN ('admin', 'operator', 'viewer'));
    END IF;
  END;
  $$;

  CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE auth_sessions
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS token_hash TEXT,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now();

  ALTER TABLE auth_sessions
    ALTER COLUMN id SET DEFAULT gen_random_uuid()::text,
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN last_seen_at SET DEFAULT now();

  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL DEFAULT 'H2GO Sensor',
    location TEXT,
    status TEXT NOT NULL DEFAULT 'online',
    is_on BOOLEAN NOT NULL DEFAULT true,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE devices
    ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'H2GO Sensor',
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'online',
    ADD COLUMN IF NOT EXISTS is_on BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

  ALTER TABLE devices
    ALTER COLUMN id SET DEFAULT gen_random_uuid()::text,
    ALTER COLUMN name SET DEFAULT 'H2GO Sensor',
    ALTER COLUMN status SET DEFAULT 'online',
    ALTER COLUMN is_on SET DEFAULT true,
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now();

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'devices_status_check'
    ) THEN
      ALTER TABLE devices
        ADD CONSTRAINT devices_status_check
        CHECK (status IN ('online', 'offline', 'warning'));
    END IF;
  END;
  $$;

  CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    device_name TEXT,
    flow_lpm NUMERIC(12, 3) NOT NULL,
    pressure_bar NUMERIC(12, 3),
    temperature_c NUMERIC(12, 3),
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE readings
    ADD COLUMN IF NOT EXISTS id TEXT DEFAULT gen_random_uuid()::text,
    ADD COLUMN IF NOT EXISTS device_name TEXT,
    ADD COLUMN IF NOT EXISTS pressure_bar NUMERIC(12, 3),
    ADD COLUMN IF NOT EXISTS temperature_c NUMERIC(12, 3),
    ADD COLUMN IF NOT EXISTS ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

  ALTER TABLE readings
    ALTER COLUMN id SET DEFAULT gen_random_uuid()::text,
    ALTER COLUMN ts SET DEFAULT now(),
    ALTER COLUMN created_at SET DEFAULT now();

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'readings_flow_lpm_nonnegative_check'
    ) THEN
      ALTER TABLE readings
        ADD CONSTRAINT readings_flow_lpm_nonnegative_check
        CHECK (flow_lpm >= 0);
    END IF;
  END;
  $$;

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    device_name TEXT,
    type TEXT NOT NULL DEFAULT 'HIGH_FLOW',
    severity TEXT NOT NULL DEFAULT 'medium',
    message TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE alerts
    ADD COLUMN IF NOT EXISTS device_name TEXT,
    ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'medium',
    ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

  ALTER TABLE alerts
    ALTER COLUMN id SET DEFAULT gen_random_uuid()::text,
    ALTER COLUMN type SET DEFAULT 'HIGH_FLOW',
    ALTER COLUMN severity SET DEFAULT 'medium',
    ALTER COLUMN is_resolved SET DEFAULT false,
    ALTER COLUMN ts SET DEFAULT now(),
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now();

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'alerts_type_check'
    ) THEN
      ALTER TABLE alerts
        ADD CONSTRAINT alerts_type_check
        CHECK (type IN ('LEAK', 'HIGH_FLOW', 'LOW_PRESSURE', 'DEVICE_OFFLINE', 'VALVE_CLOSED'));
    END IF;
  END;
  $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'alerts_severity_check'
    ) THEN
      ALTER TABLE alerts
        ADD CONSTRAINT alerts_severity_check
        CHECK (severity IN ('low', 'medium', 'high', 'critical'));
    END IF;
  END;
  $$;

  CREATE UNIQUE INDEX IF NOT EXISTS auth_sessions_token_hash_key
    ON auth_sessions (token_hash);

  CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx
    ON auth_sessions (user_id);

  CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx
    ON auth_sessions (expires_at);

  CREATE INDEX IF NOT EXISTS app_users_registration_idx
    ON app_users (is_registered, is_active);

  CREATE INDEX IF NOT EXISTS devices_status_idx
    ON devices (status);

  CREATE INDEX IF NOT EXISTS readings_device_ts_idx
    ON readings (device_id, ts DESC);

  CREATE INDEX IF NOT EXISTS alerts_device_ts_idx
    ON alerts (device_id, ts DESC);

  CREATE INDEX IF NOT EXISTS alerts_device_resolved_ts_idx
    ON alerts (device_id, is_resolved, ts DESC);

  CREATE INDEX IF NOT EXISTS alerts_resolved_ts_idx
    ON alerts (is_resolved, ts DESC);

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'set_app_users_updated_at'
    ) THEN
      CREATE TRIGGER set_app_users_updated_at
      BEFORE UPDATE ON app_users
      FOR EACH ROW
      EXECUTE FUNCTION public.set_row_updated_at();
    END IF;
  END;
  $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'set_devices_updated_at'
    ) THEN
      CREATE TRIGGER set_devices_updated_at
      BEFORE UPDATE ON devices
      FOR EACH ROW
      EXECUTE FUNCTION public.set_row_updated_at();
    END IF;
  END;
  $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'set_alerts_updated_at'
    ) THEN
      CREATE TRIGGER set_alerts_updated_at
      BEFORE UPDATE ON alerts
      FOR EACH ROW
      EXECUTE FUNCTION public.set_row_updated_at();
    END IF;
  END;
  $$;

  INSERT INTO devices (id, name, location, status, is_on, last_seen)
  VALUES ('dev-1', 'H2GO Sensor', 'Main Line', 'online', true, now())
  ON CONFLICT (id) DO NOTHING;
`;

export async function ensureDatabaseSchema() {
  await pool.query(databaseSchemaSql);
}

