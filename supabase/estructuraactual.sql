CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  nombre text NOT NULL,
  direccion text NULL,
  telefono text NULL,
  email text NULL,
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.clientes_reparto (
  id serial NOT NULL,
  cliente_id uuid NOT NULL,
  nombre_reparto character varying(255) NOT NULL,
  direccion_reparto text NULL,
  rango_horario character varying(255) NULL,
  tarifa numeric(10,2) NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL,
  telefono_reparto character varying(20) NULL,
  CONSTRAINT clientes_reparto_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_reparto_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_clientes_reparto_cliente_id ON public.clientes_reparto USING btree (cliente_id);

CREATE TABLE public.repartidores (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  nombre text NOT NULL,
  identificacion text NULL,
  telefono text NULL,
  vehiculo text NULL,
  CONSTRAINT repartidores_pkey PRIMARY KEY (id),
  CONSTRAINT repartidores_identificacion_key UNIQUE (identificacion)
);

CREATE TABLE public.reparto_cliente_reparto (
  reparto_id integer NOT NULL,
  cliente_reparto_id integer NOT NULL,
  CONSTRAINT reparto_cliente_reparto_pkey PRIMARY KEY (reparto_id, cliente_reparto_id),
  CONSTRAINT reparto_cliente_reparto_cliente_reparto_id_fkey FOREIGN KEY (cliente_reparto_id) REFERENCES clientes_reparto(id) ON DELETE CASCADE,
  CONSTRAINT reparto_cliente_reparto_reparto_id_fkey FOREIGN KEY (reparto_id) REFERENCES repartos(id) ON DELETE CASCADE
);

CREATE TABLE public.repartos (
  id serial NOT NULL,
  fecha_reparto date NOT NULL,
  repartidor_id uuid NOT NULL,
  cliente_id uuid NOT NULL,
  observaciones text NULL,
  created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NULL,
  estado character varying(20) NULL DEFAULT 'Asignado'::character varying,
  CONSTRAINT repartos_pkey PRIMARY KEY (id),
  CONSTRAINT repartos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  CONSTRAINT repartos_repartidor_id_fkey FOREIGN KEY (repartidor_id) REFERENCES repartidores(id) ON DELETE SET NULL
);

CREATE TABLE public.usuarios (
  codigo serial NOT NULL,
  nombre character varying(255) NOT NULL,
  pass text NOT NULL,
  rol character varying(50) NOT NULL,
  created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  repartidor_id uuid NULL,
  CONSTRAINT usuarios_pkey PRIMARY KEY (codigo),
  CONSTRAINT usuarios_nombre_key UNIQUE (nombre),
  CONSTRAINT fk_usuarios_repartidor FOREIGN KEY (repartidor_id) REFERENCES repartidores(id) ON UPDATE CASCADE ON DELETE SET NULL
);